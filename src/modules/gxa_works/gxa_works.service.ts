import { AllGxaWorkDto, GetSlefGxaWorkDto, SubmitGxaWorkDto } from '@/dto/GXA';
// import { GxaWork, GxaScore } from '@/entities/GXA';
import { User } from '@/entities/users';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as path from 'path';
import * as fs from 'fs';
import * as StreamZip from 'node-stream-zip';
import { Repository } from 'typeorm';
import { ActiveTimeService } from '../active-time/active-time.service';
import { GxaApplicationService } from '../gxa_application/gxa_application.service';
import { EmailService } from '../email/email.service';
import { Api } from '@/common/utils/api';
import { UserService } from '../user/user.service';
import { Result } from '@/common/interface/result';

@Injectable()
export class GxaWorksService {
  private readonly GxaWorksBasePath: string = path.join(__dirname, '../../../GXA_WORKS');
  constructor(
    // @InjectRepository(GxaWork)
    // private readonly gxaWorkRepository: Repository<GxaWork>,
    // @InjectRepository(GxaScore)
    // private readonly gxaScoreRepository: Repository<GxaScore>,
    // private readonly gxaApplicationService: GxaApplicationService,
    // private readonly activeTimeService: ActiveTimeService,
    // private readonly emailService: EmailService,
    // private readonly userService: UserService
  ) {}
  
  // async isActive() {
  //   return await this.activeTimeService.isActive('GXA_works')
  // }

  // async submitWord(
  //   user: User,
  //   submitGxaWorkDto: SubmitGxaWorkDto,
  // ) {
  //   const application = await this.gxaApplicationService.findOneByLeader(user);
    
  //   if (!application || !application.isDeliver) return { code: -1, message: '用户没有提交报名表' };
  //   if (!submitGxaWorkDto.githubUrl || !submitGxaWorkDto.websiteUrl) {
  //     return { code: -3, message: '请填写网站部署地址以及github地址' };
  //   }
  //   const _item = await this.gxaWorkRepository.findOne({
  //     where: { gxaApplicationForm: application }
  //   })
  //   let item: any;
  //   if (!_item) {
  //     item = this.gxaWorkRepository.create({
  //       gxaApplicationForm: application,
  //       ...submitGxaWorkDto,
  //     });
  //   } else {
  //     item = await this.gxaWorkRepository.preload({
  //       id: _item.id,
  //       ...submitGxaWorkDto,
  //       gxaApplicationForm: application,
  //     })
  //   }
  //   try {
  //     await this.gxaWorkRepository.save(item);
  //     return { code: 0, message: '信息提交成功, 请继续上传文件, 动态组可无视' };
  //   } catch (err) {
  //     return { code: -2, message: err };
  //   }
  // }

  // async getGxaWorkInfo(user: User): Promise<Result<GetSlefGxaWorkDto>> {
  //   const application = await this.gxaApplicationService.findOneByLeader(user);
  //   if (!application || !application.isDeliver) return { code: -1, message: '用户没有提交报名表' };
  //   const _item = await this.gxaWorkRepository.findOne({
  //     where: { gxaApplicationForm: application }
  //   })
  //   // if ()
  //   if (_item) return { code: 0, message: '', data: <AllGxaWorkDto>_item };
  //   return { code: -2, message: '用户当前未提交' };
  // }
  
  // async uploadFile(user: User, file: Express.Multer.File): Promise<Result<string>> {
  //   // 创建好文件夹, 之前的数据全删了
  //   await this.mkdir(user);
  //   const application = await this.gxaApplicationService.findOneByLeader(user)
  //   if (application.group) return Api.err(-10, '动态组不能上传');
  //   if (!application || !application.isDeliver) return { code: -1, message: '用户没有提交报名表' };
  //   // 用户文件夹
  //   const userPath = `${this.GxaWorksBasePath}/${application.id}`
    
  //   // 保存zip文件到文件夹下面
  //   fs.writeFileSync(`${userPath}/code.zip`, file.buffer);
  //   const zip = new StreamZip({
  //     file: `${userPath}/code.zip`,
  //     storeEntries: true
  //   });
  //   return new Promise((resolve, reject) => {
  //     zip.on('ready', () => {
  //       zip.extract(null, `${userPath}/website`, async (err: any, count) => {
  //         console.log(err ? 'Extract error' : `Extracted ${count} entries`);
  //           zip.close();
  //           // await this.emailService
  //           for (const item of ['leader', 'teamMember1', 'teamMember2']) {
  //             if (application[item]) {
  //               await this.emailService.sendSubmitGxaWorksEmail({
  //                 qq: application[item].qq,
  //                 teamName: application.teamName,
  //                 url: `http://yumingxi.xyz:${application.portNumber}/`,
  //               })
  //             }
  //           }
  //           resolve({ code: 0, message: '上传成功, 请查看邮箱' })
  //       });
  //     });
  //     zip.on('error', err => {
  //       reject(err)
  //     });
  //   })
  // }

  // async mkdir(user: User) {
  //   const application = await this.gxaApplicationService.findOneByLeader(user)
  //   if (!application || !application.isDeliver) return { code: -1, message: '用户没有提交报名表' };
  //   // 基础路径
  //   const userPath = `${this.GxaWorksBasePath}/${application.id}`

  //   // 用户文件夹
  //   try {
  //     let item = fs.statSync(userPath)
  //     if (!(item && item.isDirectory)) {
  //       fs.unlinkSync(userPath)
  //       fs.mkdirSync(userPath);
  //     }
  //   } catch {
  //     fs.mkdirSync(userPath);
  //   }
  //   // 把website 和code.zip删除掉
  //   try {
  //     let item = fs.statSync(`${userPath}/website`)
  //     if (item.isDirectory()) {
  //       this.removeDir(`${userPath}/website`)
  //     }
  //   } catch {}
  //   try {
  //     let item = fs.statSync(`${userPath}/code.zip`)
  //     if (item.isFile()) fs.unlinkSync(`${userPath}/code.zip`)
  //   } catch {}
  //   // 重新新建用户文件夹下面的website
  //   try {
  //     let item = fs.statSync(`${userPath}/website`)
  //     if (!(item && item.isDirectory)) {
  //       fs.unlinkSync(`${userPath}/website`)
  //       fs.mkdirSync(`${userPath}/website`);
  //     }
  //   } catch {
  //     fs.mkdirSync(`${userPath}/website`)
  //   }
  // }
  // async removeDir(dir: any) {
  //   let files = fs.readdirSync(dir)
  //   for(var i = 0; i < files.length; i ++ ) {
  //     let newPath = path.join(dir,files[i]);
  //     let stat = fs.statSync(newPath)
  //     if(stat.isDirectory()){
  //       //如果是文件夹就递归下去
  //       this.removeDir(newPath);
  //     }else {
  //      //删除文件
  //       fs.unlinkSync(newPath);
  //     }
  //   }
  //   fs.rmdirSync(dir) //如果文件夹是空的，就将自己删除掉
  // }

  // async getFormulaGxaList() {
  //   const _list = await this.gxaWorkRepository.find({
  //     where: {
  //       isApproved: true
  //     },
  //     relations: ['gxaApplicationForm']
  //   });
  //   const data = {
  //     static: [],
  //     dynamic: []
  //   }
  //   _list.forEach((item: GxaWork) => {
  //     const __ = {
  //       id: item.id,
  //       showImg: item.showImg,
  //       websiteUrl: item.websiteUrl,
  //       workname: item.gxaApplicationForm.workName,
  //       websiteIntroduction: item.websiteIntroduction
  //     }      
  //     if (item.gxaApplicationForm.group) data.dynamic.push(__)
  //     else data.static.push(__)
  //   })
  //   return Api.ok(data)
  // }

  // private async getWorkByStudentId(studentId: string) {
  //   const _u = await this.userService.findOneByStudentId(studentId)
  //   if (!_u) throw new Error('未查询到用户');
  //   const _a = await this.gxaApplicationService.findOneByUser(_u)
  //   if (!_a) throw new Error('未查询到报名表');
  //   const _w = await this.gxaWorkRepository.findOne({
  //     where: { gxaApplicationForm: _a }
  //   })
  //   if (!_w) throw new Error('未查询到作品');
  //   return _w
  // }

  // async getTeamIsApprove(studentId: string): Promise<Result<boolean>> {
  //   try {
  //     const _ = await this.getWorkByStudentId(studentId)
  //     return { code: 0, message: '查询成功', data: _?.isApproved };
  //   } catch (err) {
  //     return { code: -1, message: err.message };
  //   }
  // }

  // async getTeamScore(studentId: string) {
  //   try {
  //     const _ = await this.getWorkByStudentId(studentId);
  //     const __ = await this.gxaScoreRepository.findOne({
  //       select: ['score'],
  //       where: { work: _ }
  //     })
  //     if (!__) return Api.err(-2, '评委尚未打分，请等待')
  //     const score = JSON.parse(__.score)
  //     const data: number[] = []
  //     for (const key in score) {
  //       data.push(score[key].reduce((pre: number, curt: number) => pre + curt, 0))
  //     }
  //     return { code: 0, message: '获取成功', data };
  //   } catch (err) {
  //     return { code: -1, message: err.message };
  //   }
  // }
}
