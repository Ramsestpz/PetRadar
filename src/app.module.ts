import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config'; 
import { PetsModule } from './pets/pets.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), 
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'root', 
      database: 'petradar',
      autoLoadEntities: true,
      synchronize: true, 
    }),
    PetsModule,
  ],
})
export class AppModule {}