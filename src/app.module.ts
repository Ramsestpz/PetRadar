import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config'; 
// import { CacheModule } from '@nestjs/cache-manager';
// import * as redisStore from 'cache-manager-redis-store';
import { PetsModule } from './pets/pets.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), 
    
    // CacheModule.register({
    //   isGlobal: true,
    //   store: redisStore as any,
    //   host: process.env.REDIS_HOST || 'localhost',
    //   port: parseInt(process.env.REDIS_PORT || '6379'),
    //   ttl: 300, 
    // }),

    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL || `postgresql://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
      autoLoadEntities: true,
      synchronize: true, 
      ssl: process.env.DB_HOST !== 'localhost' ? {
        rejectUnauthorized: false,
      } : false,
    }),
    PetsModule,
  ],
})
export class AppModule {}