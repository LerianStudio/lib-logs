import {
  CallHandler,
  ExecutionContext,
  Inject,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { lastValueFrom, Observable } from 'rxjs';
import { LoggerAggregator } from '../aggregator/logger-aggregator';
import { RequestIdRepository } from '../request-id/request-id-repository';

@Injectable()
export class LoggerInterceptor implements NestInterceptor {
  constructor(
    @Inject(RequestIdRepository)
    private readonly requestIdRepository: RequestIdRepository,
    @Inject(LoggerAggregator) private readonly logger: LoggerAggregator,
  ) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();

    const body =
      request.method !== 'GET' && request.method !== 'DELETE'
        ? { body: request.body }
        : {};

    return new Observable((subscriber) => {
      this.logger.runWithContext(
        request.url,
        request.method,
        {
          requestId: this.requestIdRepository.get(),
          query: request.query,
          handler: `${context.getClass().name}.${context.getHandler().name}`,
          ...body,
        },
        async () => {
          try {
            const response = await lastValueFrom(next.handle());

            subscriber.next(response);
            subscriber.complete();
          } catch (error) {
            subscriber.error(error);
          }
        },
      );
    });
  }
}
