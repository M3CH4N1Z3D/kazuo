import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ProductService } from '../modules/product/product.service';
import { StoreService } from '../modules/store/store.service';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class ChatBotService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(
    private readonly productService: ProductService,
    private readonly storeService: StoreService,
  ) {
    this.genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });
  }

  async chat(message: string, history: any[], userId?: string, language?: string) {
    try {
      const languageMap: Record<string, string> = {
        en: 'English',
        es: 'Spanish',
        fr: 'French',
        pt: 'Portuguese',
      };
      // Normalizamos el código de idioma (ej: es-ES -> es)
      const langCode = (language || 'es').substring(0, 2).toLowerCase();
      const selectedLanguage = languageMap[langCode] || 'Spanish';
      
      console.log(`[ChatBot] Language requested: ${language}, using: ${selectedLanguage}`);

      // 1. Definir las herramientas (Tools) que Gemini puede usar
      const tools: any = [
        {
          function_declarations: [
            {
              name: 'getStores',
              description: 'Obtiene la lista de bodegas o tiendas disponibles del usuario actual. Devuelve ID, nombre y categoría de cada bodega.',
            },
            {
              name: 'searchProducts',
              description: 'Busca productos en el inventario. Puede filtrar por un término de búsqueda y opcionalmente por el ID de una bodega específica.',
              parameters: {
                type: 'OBJECT',
                properties: {
                  query: {
                    type: 'STRING',
                    description: '(Opcional) Término de búsqueda para el producto (nombre, descripción, etc.). Si se omite, devuelve todos los productos.',
                  },
                  storeId: {
                    type: 'STRING',
                    description: '(Opcional) El ID de la bodega donde buscar. Si no se provee, busca en todas o pide aclaración.',
                  },
                },
              },
            },
            {
              name: 'getProductStatistics',
              description: 'Obtiene estadísticas generales de los productos o de una bodega específica.',
              parameters: {
                type: 'OBJECT',
                properties: {
                  storeId: {
                    type: 'STRING',
                    description: '(Opcional) El ID de la bodega para obtener estadísticas específicas.',
                  },
                },
              },
            }
          ],
        },
      ];

      // 2. Configurar el modelo con las herramientas
      const model = this.genAI.getGenerativeModel({
        model: 'gemini-2.5-pro',
        tools: tools,
        systemInstruction: `You are a helpful virtual assistant for the Spot-On inventory management system. You must respond in ${selectedLanguage}. be concise and direct.`,
      });

      // 3. Iniciar el chat con el historial proporcionado
      // Mapear el historial al formato de Gemini si es necesario (USER/MODEL)
      // Asumimos que history viene en formato compatible o lo adaptamos
      const chat = model.startChat({
        history: history.map((h) => ({
          role: h.role === 'model' || h.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: h.content || (h.parts && h.parts[0]?.text) || '' }],
        })),
      });

      // 4. Enviar el mensaje del usuario
      let result = await chat.sendMessage(message);
      let response = await result.response;
      let text = '';
      
      // 5. Verificar si el modelo quiere llamar a una función (Function Calling)
      // Usamos un bucle para manejar múltiples turnos de llamadas a funciones si es necesario
      let functionCalls = response.functionCalls();

      while (functionCalls && functionCalls.length > 0) {
        console.log('Gemini solicitó ejecutar funciones:', functionCalls);

        // Ejecutar las funciones solicitadas
        const functionResponses = await Promise.all(
          functionCalls.map(async (call) => {
            const { name, args } = call;
            let apiResponse;

            console.log(`Ejecutando herramienta: ${name} con argumentos:`, args);

            if (name === 'getStores') {
              // Si tenemos userId, buscamos sus tiendas. Si no, devolvemos error o lista vacía.
              if (userId) {
                try {
                    apiResponse = await this.storeService.findAllStores(userId);
                } catch (e) {
                    console.error('Error en getStores:', e);
                    apiResponse = { error: 'No se encontraron bodegas o hubo un error al buscarlas.' };
                }
              } else {
                apiResponse = { error: 'Usuario no identificado para buscar bodegas.' };
              }
            } else if (name === 'searchProducts') {
              try {
                const { query } = args as any;
                let { storeId } = args as any;

                if (storeId) {
                    // Validar si storeId es un UUID válido
                    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
                    let isValidId = uuidRegex.test(storeId);

                    if (!isValidId) {
                        // Lógica de recuperación: buscar por nombre si no es un UUID válido
                        if (userId) {
                            try {
                                const userStores = await this.storeService.findAllStores(userId);
                                // Buscar coincidencia exacta o si el nombre contiene el término
                                const foundStore = userStores.find(s =>
                                    s.name.toLowerCase() === storeId.toLowerCase() ||
                                    s.name.toLowerCase().includes(storeId.toLowerCase())
                                );

                                if (foundStore) {
                                    storeId = foundStore.id;
                                    isValidId = true;
                                } else {
                                    apiResponse = { error: `No pude encontrar una bodega llamada "${storeId}".` };
                                }
                            } catch (e) {
                                // Si findAllStores falla (ej: 404), asumimos que no hay tiendas
                                apiResponse = { error: `No encontré bodegas asociadas para buscar "${storeId}".` };
                            }
                        } else {
                            apiResponse = { error: `El ID de bodega "${storeId}" no es válido.` };
                        }
                    }

                    if (isValidId) {
                        console.log(`[DEBUG] Buscando productos para storeId: ${storeId}`);
                        const products = await this.productService.getProductsByStoreId(storeId);
                        console.log(`[DEBUG] Encontrados ${products.length} productos en la base de datos para la bodega ${storeId}`);
                        
                        if (query && query.trim() !== '' && query.toLowerCase() !== 'todo') {
                            // Filtramos manualmente por query
                            console.log(`[DEBUG] Filtrando por query: "${query}"`);
                            apiResponse = products.filter(p =>
                                p.name.toLowerCase().includes(query.toLowerCase())
                            );
                        } else {
                            // Devolver todos los productos de la bodega
                            apiResponse = products;
                        }
                        console.log(`[DEBUG] Resultados enviados: ${Array.isArray(apiResponse) ? apiResponse.length : 0}`);
                    }
                } else {
                     // Si no hay storeId, buscamos en todos (idealmente debería ser filtrado por usuario si es posible)
                     const allProducts = await this.productService.findAll();
                     if (query && query.trim() !== '' && query.toLowerCase() !== 'todo') {
                         apiResponse = allProducts.filter(p =>
                            p.name.toLowerCase().includes(query.toLowerCase())
                         );
                     } else {
                         apiResponse = allProducts;
                     }
                }
              } catch (e) {
                  console.error('Error en searchProducts:', e);
                  apiResponse = { error: 'Error al buscar productos.' };
              }
            } else if (name === 'getProductStatistics') {
                try {
                    const { storeId } = args as any;
                    let products;
                    
                    if (storeId) {
                         products = await this.productService.getProductsByStoreId(storeId);
                    } else {
                         products = await this.productService.findAll();
                    }

                    apiResponse = {
                        totalProducts: products.length,
                        message: storeId ? `Estadísticas para la bodega ${storeId}` : 'Estadísticas generales.',
                    };
                } catch (e) {
                    console.error('Error en getProductStatistics:', e);
                    apiResponse = { error: 'Error al obtener estadísticas.' };
                }
            } else {
                apiResponse = { error: `Función ${name} no implementada.` };
            }

            return {
              functionResponse: {
                name,
                response: { result: apiResponse },
              },
            };
          })
        );

        // 6. Enviar los resultados de las funciones de vuelta al modelo
        console.log('Enviando resultados de funciones a Gemini...');
        result = await chat.sendMessage(functionResponses);
        response = await result.response;
        
        // Verificar si hay más llamadas a funciones en la nueva respuesta
        functionCalls = response.functionCalls();
      }

      // Si no hubo más llamadas a función (o nunca las hubo), obtener la respuesta de texto
      text = response.text();

      console.log('Respuesta generada:', text);
      return { response: text };

    } catch (error) {
      console.error('Error en ChatbotService:', error);
      throw new InternalServerErrorException('Error al procesar la solicitud del chatbot.');
    }
  }
}
