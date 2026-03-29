import { HttpStatus } from '@nestjs/common';

export class IResponseMetadata {
  statusCode: HttpStatus;
  success: boolean = true;
  message: string;
}

export class IResponse<T> {
  _metadata: IResponseMetadata;
  _data: T;
}
