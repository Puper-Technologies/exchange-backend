import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '@v1/users/users.module';
import LocalStrategy from './strategies/local.strategy';
import JwtAccessStrategy from './strategies/jwt.strategy';
import { LoggerModule } from '@shared/logger/logger.module';
import { FirebaseAuthService } from '@resources/firebase/firebase.service';
/**
 * Root module of the application
 */
@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({
      secret: 'This is test secret',
    }),
    LoggerModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    LocalStrategy,
    JwtAccessStrategy,
    FirebaseAuthService,
  ],
  exports: [AuthService],
})
export class AuthModule {}
