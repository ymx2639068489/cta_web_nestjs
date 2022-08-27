import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { GxaApplicationForm } from '.';
import { BaseEntity } from '../base.entity';

@Entity()
export class GxaWork extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;
  
  // 作品和报名表一对一
  @OneToOne(() => GxaApplicationForm)
  @JoinColumn()
  gxaApplicationForm: GxaApplicationForm;

  // 首页展示图片地址
  @Column()
  showImg: string;

  // 网站简介
  @Column({ type: 'longtext' })
  websiteIntroduction: string;

  /**
   * 如果此作品是静态，则会分配到一个服务器某一个端口号上
   * 如果是动态，则会提供一个前台地址。
   * 提交作品时，会提交对应的网址，在用户注册时或动态组自行提交
   */
  @Column()
  websiteUrl: string;
}