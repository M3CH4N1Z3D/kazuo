import {
  ConflictException,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { CompanyRepository } from './company.repository';
import { CreateCompanyDto, UpdateCompanyDto } from './company.dto';
import { Company } from '../Entities/company.entity';
import { UsersService } from '../modules/users/users.service';
import { Repository, In } from 'typeorm';
import { Users } from '../Entities/users.entity';
import { MailService } from '../mail/mail.service';
import { validate as isUUID } from 'uuid';
import { Store } from '../Entities/store.entity';
import { Product } from '../Entities/product.entity';
import { Provider } from '../Entities/providers.entity';

@Injectable()
export class CompanyService {
  constructor(
    private readonly companyRepository: CompanyRepository,
    private readonly usersService: UsersService,
    private readonly mailService: MailService,
    private readonly jwtService: JwtService,
    @InjectRepository(Store)
    private readonly storeRepository: Repository<Store>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Provider)
    private readonly providerRepository: Repository<Provider>,
  ) {}

  async getAllCompanies(): Promise<Company[]> {
    return this.companyRepository.find({ relations: ['users'] });
  }

  async updateCompany(
    companyId: string,
    updateCompanyDto: UpdateCompanyDto,
  ): Promise<Company> {
    const company = await this.companyRepository.findOne({
      where: { id: companyId },
    });

    if (!company) {
      throw new NotFoundException(`Compañía con id ${companyId} no encontrada`);
    }

    Object.assign(company, updateCompanyDto);

    return this.companyRepository.save(company);
  }

  async createCompany(createCompanyDto: CreateCompanyDto): Promise<Company> {
    const { userId } = createCompanyDto;

    const existingCompanies = await this.companyRepository.find({
      where: { users: { id: userId } },
    });

    if (existingCompanies.length > 0) {
      throw new ConflictException(
        'El usuario ya tiene una compañía registrada.',
      );
    }

    const user = await this.usersService.getUserById(userId);
    if (!user) {
      throw new NotFoundException(`Usuario con id ${userId} no encontrado`);
    }

    const newCompany = this.companyRepository.create({
      ...createCompanyDto,
      createdAt: new Date(),
    });
    newCompany.users = [user];

    await this.companyRepository.save(newCompany);
    return newCompany;
  }

  async getCompaniesByUserId(userId: string): Promise<Company[]> {
    const user = await this.usersService.getUserById(userId);
    if (!user) {
      throw new NotFoundException(`Usuario con id ${userId} no encontrado`);
    }

    const companies = await this.companyRepository
      .createQueryBuilder('company')
      .leftJoinAndSelect('company.users', 'users')
      .where((qb) => {
        const subQuery = qb
          .subQuery()
          .select('c.id')
          .from(Company, 'c')
          .innerJoin('c.users', 'u')
          .where('u.id = :userId')
          .getQuery();
        return 'company.id IN ' + subQuery;
      })
      .setParameter('userId', userId)
      .getMany();

    return companies;
  }

  async getCompaniesById(userId: string): Promise<Company[]> {
    const user = await this.usersService.getUserById(userId);
    if (!user) {
      throw new NotFoundException(`Usuario con id ${userId} no encontrado`);
    }

    return this.companyRepository.find({
      where: { users: { id: userId } },
      relations: ['users'],
    });
  }

  async getCompanyById(companyId: string): Promise<Company> {
    const company = await this.companyRepository.findOne({
      where: { id: companyId },
      relations: ['users'], 
    });
  
    if (!company) {
      throw new NotFoundException(`Compañía con id ${companyId} no encontrada`);
    }
  
    return company;
  }

  async addUserToCompany(
    addUserToCompanyDto: { email: string; name: string; position?: string },
    companyId: string,
  ): Promise<void> {
    const { email: userEmail, name: userName, position } = addUserToCompanyDto;
    const company = await this.companyRepository.findOne({
      where: { id: companyId },
      relations: ['users'],
    });

    if (!company) {
      console.log('Error: Compañía no encontrada');
      throw new NotFoundException('Compañía no encontrada');
    }

    if (!company.users.some((user) => user.email === userEmail)) {
      const user = await this.usersService.getUserByEmail(userEmail);
      if (user) {
        company.users.push(user);
        await this.companyRepository.save(company);

        // Actualizar el estado del usuario a NormalUser (isAdmin = false) y asignar posición
        await this.usersService.setAdminStatus(user.id, false);
        if (position) {
          await this.usersService.updateUser(user.id, { position });
        }

        console.log(
          `Usuario ${user.email} agregado a la compañía ${company.CompanyName} exitosamente.`,
        );

        await this.mailService.sendMail(
          user.email,
          'Fuiste agregado a una Compañía',
          `Hola ${user.name}, te informamos que has sido agregado a la compañía ${company.CompanyName}.`,
        );

        await this.mailService.sendMail(
          company.email,
          'Nuevo usuario agregado a tu Compañía',
          `Hola, te informamos que el usuario ${user.name} (${user.email}) ha sido agregado a tu compañía ${company.CompanyName}.`,
        );
      } else {
        console.log(
          `El usuario con email ${userEmail} no existe en el sistema. Se enviará una invitación a registrarse.`,
        );

        const token = this.jwtService.sign(
          { email: userEmail, name: userName, companyId, position, type: 'invitation' },
          { expiresIn: '7d' },
        );

        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const invitationLink = `${frontendUrl}/Register?token=${token}&email=${userEmail}&name=${encodeURIComponent(userName)}`;

        const htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
            <div style="text-align: center; margin-bottom: 20px;">
               <h2 style="color: #333;">Invitación a unirse a ${company.CompanyName}</h2>
            </div>
            <p style="color: #555; font-size: 16px;">Hola ${userName},</p>
            <p style="color: #555; font-size: 16px;">Hemos recibido una solicitud para que te unas a la compañía <strong>${company.CompanyName}</strong>.</p>
            <p style="color: #555; font-size: 16px;">Por favor, regístrate en nuestro sitio para completar el proceso haciendo clic en el siguiente botón:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${invitationLink}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">Registrarse ahora</a>
            </div>
            <p style="color: #999; font-size: 14px; text-align: center;">Si el botón no funciona, copia y pega el siguiente enlace en tu navegador:</p>
            <p style="color: #4F46E5; font-size: 12px; text-align: center; word-break: break-all;">${invitationLink}</p>
          </div>
        `;

        await this.mailService.sendMail(
          userEmail,
          'Invitación a registrarte',
          `Hola ${userName}, hemos recibido una solicitud para que te unas a la compañía ${company.CompanyName}. Por favor, regístrate en nuestro sitio para poder agregarte usando el siguiente enlace: ${invitationLink}`,
          htmlContent,
        );
      }
    } else {
      console.log(
        `El usuario con email ${userEmail} ya está en la compañía ${company.CompanyName}.`,
      );
      throw new ConflictException('El usuario ya está en la compañía');
    }
  }

  async storesByCompany(companyId: string) {
    if (!isUUID(companyId)) {
      return [];
    }

    const stores = await this.companyRepository.find({
      where: { id: companyId },
      relations: { stores: { category: true } },
    });
    if (!stores) {
      throw new NotFoundException(
        `La compania con  id ${companyId} no fue encontrada`,
      );
    }

    return stores;
  }

  async checkUserDependencies(userId: string) {
    const stores = await this.storeRepository.count({
      where: { user: { id: userId } },
    });
    const products = await this.productRepository.count({
      where: { user: { id: userId } },
    });
    const providers = await this.providerRepository
      .createQueryBuilder('provider')
      .innerJoin('provider.users', 'user', 'user.id = :userId', { userId })
      .getCount();

    return {
      hasDependencies: stores > 0 || products > 0 || providers > 0,
      stores,
      products,
      providers,
    };
  }

  async removeUserFromCompany(
    companyId: string,
    userId: string,
    options: { migrateToEmail?: string; forceDelete?: boolean } = {},
  ) {
    const company = await this.companyRepository.findOne({
      where: { id: companyId },
      relations: ['users'],
    });

    if (!company) {
      throw new NotFoundException('Compañía no encontrada');
    }

    const userIndex = company.users.findIndex((u) => u.id === userId);
    if (userIndex === -1) {
      throw new NotFoundException('Usuario no encontrado en esta compañía');
    }

    const dependencies = await this.checkUserDependencies(userId);

    // Helper to remove user from company relation
    const removeUserFromCompanyRelation = async () => {
      company.users = company.users.filter((u) => u.id !== userId);
      await this.companyRepository.save(company);
    };

    if (dependencies.hasDependencies) {
      if (options.forceDelete) {
        await removeUserFromCompanyRelation();
        await this.usersService.deleteUser(userId);
        return { message: 'Usuario y sus datos eliminados exitosamente.' };
      }

      if (options.migrateToEmail) {
        const targetUser = await this.usersService.getUserByEmail(
          options.migrateToEmail,
        );
        if (!targetUser) {
          throw new NotFoundException(
            `El usuario destino ${options.migrateToEmail} no existe.`,
          );
        }

        // Migrate Stores
        await this.storeRepository.update(
          { user: { id: userId } },
          { user: targetUser },
        );

        // Migrate Products
        await this.productRepository.update(
          { user: { id: userId } },
          { user: targetUser },
        );

        // Migrate Providers (ManyToMany)
        const providersList = await this.providerRepository.find({
          where: { users: { id: userId } },
          relations: ['users'],
        });

        for (const provider of providersList) {
          // Add target user if not present
          const alreadyHasTarget = provider.users.some(
            (u) => u.id === targetUser.id,
          );
          if (!alreadyHasTarget) {
            provider.users.push(targetUser);
          }
          // Remove old user
          provider.users = provider.users.filter((u) => u.id !== userId);
          await this.providerRepository.save(provider);
        }

        await removeUserFromCompanyRelation();
        await this.usersService.deleteUser(userId);
        return {
          message: `Datos migrados a ${options.migrateToEmail} y usuario eliminado.`,
        };
      }

      throw new ConflictException({
        message: 'El usuario tiene datos asociados.',
        dependencies,
        code: 'DEPENDENCIES_EXIST',
      });
    }

    // No dependencies
    await removeUserFromCompanyRelation();
    await this.usersService.deleteUser(userId);
    return { message: 'Usuario eliminado exitosamente.' };
  }

  async updateUserPermissions(
    companyId: string,
    userId: string,
    permissions: string[],
  ): Promise<void> {
    const company = await this.companyRepository.findOne({
      where: { id: companyId },
      relations: ['users'],
    });

    if (!company) {
      throw new NotFoundException('Compañía no encontrada');
    }

    const userInCompany = company.users.find((u) => u.id === userId);
    if (!userInCompany) {
      throw new NotFoundException('Usuario no encontrado en esta compañía');
    }

    await this.usersService.updateUser(userId, { permissions });
  }
}