import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { MD5 } from 'crypto-js';
import { decrypt, encrypt } from '../../../common/utils/encryption';

@Injectable()
export class createUserPipe implements PipeTransform {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  transform(value: any, _metadata: ArgumentMetadata) {
    console.log('userLoginPipe解密中');
    // try {
    //   value.studentId = decrypt(value.studentId);
    //   value.phoneNumber = decrypt(value.qq);
    // } catch {
    //   throw new BadRequestException('数据解析失败');
    // }
    
    // if (!value.studentId || !value.phoneNumber) {
    //   throw new BadRequestException(`decrypt error`);
    // }
    // value.password = MD5(value.password).toString();
    return value;
  }
}

@Injectable()
export class userLoginPipe implements PipeTransform {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  transform(value: any, _metadata: ArgumentMetadata) {
    console.log('userLoginPipe解密中');
    const val = { ...value };
    // try {
    //   val.studentId = decrypt(value.studentId);
    // } catch (err) {
    //   throw new BadRequestException('数据解析失败');
    // }
    // val.password = MD5(val.password).toString();
    return val;
  }
}
