import { BadRequestException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from '../../Entities/users.entity';
import { Repository, MoreThan } from 'typeorm';
import { MailService } from '../../mail/mail.service';
import { v4 as uuidv4 } from 'uuid';
import { CryptoService } from '../../crypto/crypto.service';
import { UserRepository } from '../users/users.repository';
import { CompanyService } from '../../company/company.service';
import axios from 'axios';
import { ChangePasswordDto, CreateUserDto } from '../users/user.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    private readonly cryptoService: CryptoService,
    private readonly companyService: CompanyService,
  ) {}

  getAuth(): string {
    return 'Auth';
  }

  async signIn(email: string, password: string) {
    if (!email || !password) throw new BadRequestException('Datos obligatorios');
  
    const user = await this.userRepository.getUserByEmail(email);
    if (!user) throw new BadRequestException('Credenciales inválidas');
  
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) throw new BadRequestException('Credenciales inválidas');
  
    return this.generateAuthResponse(user);
  }
  

  async signUp(user: CreateUserDto): Promise<Partial<Users>> {
    const { email, password, invitationToken } = user;
    const foundUser = await this.userRepository.getUserByEmail(email);
    if (foundUser) throw new BadRequestException('El correo electrónico ya está registrado.');

    const hashedPass = await bcrypt.hash(password, 10);

    const createdUser = await this.userRepository.createUser({
      ...user,
      password: hashedPass,
      isAdmin: true,
    });

    if (invitationToken) {
      try {
        const payload = this.jwtService.verify(invitationToken);
        if (payload.type === 'invitation' && payload.email === email) {
          await this.companyService.addUserToCompany(
            { email, name: user.name, position: payload.position },
            payload.companyId,
          );
        } else {
          throw new BadRequestException('Token de invitación inválido');
        }
      } catch (error) {
        throw new BadRequestException('Token de invitación inválido o expirado');
      }
    }

    await this.mailService.sendWelcome(createdUser.email, createdUser.name);

    return {};
  }

  async requestPasswordReset(email: string): Promise<string> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) throw new BadRequestException('Email no encontrado');

    const token = uuidv4();
    const expirationTime = new Date();
    expirationTime.setHours(expirationTime.getHours() + 1);

    await this.userRepository.update(user.id, {
      resetPasswordToken: token,
      resetPasswordExpires: expirationTime,
    });

    await this.mailService.sendPasswordReset(email, user.name, token);

    return token;
  }

  async resetPassword(
    token: string,
    newPassword: string,
    confirmNewPass: string,
  ): Promise<string> {
    if (newPassword !== confirmNewPass) {
      throw new BadRequestException('Las contraseñas no coinciden');
    }

    if (newPassword.length < 8) {
      throw new BadRequestException(
        'La contraseña debe tener al menos 8 caracteres',
      );
    }

    const user = await this.userRepository.findOne({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: MoreThan(new Date()),
      },
    });

    if (!user) throw new BadRequestException('Token inválido o expirado');

    const hashedPass = await bcrypt.hash(newPassword, 10);

    await this.userRepository.update(user.id, {
      password: hashedPass,
      resetPasswordToken: null,
      resetPasswordExpires: null,
    });

    return 'Contraseña actualizada correctamente';
  }

  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt();
    return bcrypt.hash(password, salt);
  }
  async validateUser(payload: any) {
    return { userId: payload.sub, username: payload.name };
  }

  async validateAuth0User(auth0User: any) {
    let user = await this.userRepository.getUserByEmail(auth0User.email);

    if (!user.auth0Id) {
      // Si el usuario existe pero no tiene auth0Id, lo actualizamos
      user.auth0Id = auth0User.sub;
      await this.userRepository.save(user);
    }

    return {
      id: user.id,
      email: user.email,
      companies: user.companies
  };
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async loginWithGoogle(token: string) {
    try {
      const googleUser = await axios.get(
        'https://www.googleapis.com/oauth2/v3/userinfo',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const { sub, email, name, picture } = googleUser.data;

      let user = await this.userRepository.getUserByEmail(email);

      if (user) {
        if (!user.googleId) {
          user.googleId = sub;
          await this.userRepository.save(user);
        }
      } else {
        const password = await bcrypt.hash(uuidv4(), 10);
        user = await this.userRepository.createUser({
          email,
          name,
          imgUrl: picture,
          password,
          googleId: sub,
          isAdmin: true,
        });
        // Ensure companies is an array for the response generator
        user.companies = [];
      }

      return this.generateAuthResponse(user);
    } catch (error) {
      throw new BadRequestException('Token de Google inválido o error en la autenticación');
    }
  }

  async changePassword(
    userId: string,
    changePasswordDto: ChangePasswordDto,
  ): Promise<string> {
    const { oldPassword, newPassword } = changePasswordDto;

    const user = await this.userRepository.getById(userId);
    if (!user) throw new BadRequestException('Usuario no encontrado');

    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordValid)
      throw new BadRequestException('La contraseña actual es incorrecta');

    const hashedPass = await bcrypt.hash(newPassword, 10);

    await this.userRepository.updateUser(userId, { password: hashedPass });

    return 'Contraseña actualizada correctamente';
  }

  private generateAuthResponse(user: Users) {
    const payload = {
      id: user.id,
      email: user.email,
      isAdmin: user.isAdmin,
    };

    const token = this.jwtService.sign(payload);

    const companyId =
      user.companies && user.companies.length > 0 ? user.companies[0].id : null;

    return {
      message: 'Usuario loggeado',
      token,
      email: user.email,
      name: user.name,
      id: user.id,
      igmUrl: user.imgUrl,
      isAdmin: user.isAdmin ? true : false,
      isSuperAdmin: user.isSuperAdmin ? true : false,
      company: companyId,
    };
  }
}
