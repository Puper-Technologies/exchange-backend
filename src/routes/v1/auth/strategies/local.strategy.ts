import { Strategy } from "passport-local";
import { validate } from "class-validator";
import { FastifyRequest } from "fastify";
import { PassportStrategy } from "@nestjs/passport";
import { ValidationError, Injectable, UnauthorizedException } from "@nestjs/common";
import { LoginAuthDto } from "../dto/login-auth.dto";
import { ValidateUserPayload } from "../interfaces/validate-user-payload";
import ValidationExceptions from "@exceptions/validation.exceptions";

import { AuthService } from "../auth.service";

@Injectable()
export default class LocalStrategy extends PassportStrategy(Strategy) {
    constructor(private authService: AuthService) {
        super({
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true,
        });
    }

    async validate(req: FastifyRequest, email: string, password: string): Promise<ValidateUserPayload> {
        const errors = await validate(new LoginAuthDto(req.body)) as ValidationError[];

        if (errors.length > 0) {
            throw new ValidationExceptions(errors);
        }

        const user = await this.authService.validateUser(email, password);

        if (!user) {
            throw new UnauthorizedException();
        }

        return user;
    }

}