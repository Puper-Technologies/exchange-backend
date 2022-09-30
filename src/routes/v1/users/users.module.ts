import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User, UserSchema } from './schemas/user.schema';
import { UsersRepository } from './user.repository';
// import UserDto from './dto/user.dto';
// import LocalStrategy from '@v1/auth/strategies/local.strategy';
// import JwtAccessStrategy from '@v1/auth/strategies/jwt.strategy';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { LoggerModule } from '@shared/logger/logger.module';
import { FirebaseAuthService } from '@resources/firebase/firebase.service';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: 'This is test secret',
    }),
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      },
    ]),
    LoggerModule,
  ],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository, FirebaseAuthService],
  exports: [UsersService],
})
export class UsersModule {}
