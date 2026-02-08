import { Controller, Post, Body, Res, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { ChatBotService } from './chatbot.service';

@Controller('chatbot')
export class ChatBotController {
  constructor(private readonly chatBotService: ChatBotService) {}

  @Post()
  async chat(
    @Body('message') message: string,
    @Body('history') history: any[] = [],
    @Body('userId') userId: string, // Mantenemos userId para el contexto de las tools
    @Res() res: Response,
  ) {
    try {
      const response = await this.chatBotService.chat(
        message,
        history,
        userId
      );
      return res.status(HttpStatus.OK).json(response);
    } catch (error) {
      console.error('Error en ChatbotController:', error);
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ error: 'Error interno del servidor' });
    }
  }
}
