import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TalentModule } from './modules/talent/talent.module';
import { RadarModule } from './modules/radar/radar.module';
import { ScoringModule } from './modules/scoring/scoring.module';
import { SharedModule } from './modules/shared/shared.module';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TalentModule,
    RadarModule,
    ScoringModule,
    SharedModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT ?? 5432),
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      autoLoadEntities: true,
      synchronize: false,
      ssl:
        process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
