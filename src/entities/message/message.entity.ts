import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { User } from '../users';
@Entity()
export class Message extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  @JoinColumn()
  from: User;

  @ManyToOne(() => User)
  @JoinColumn()
  to: User;

  @Column({ type: 'longtext'})
  content: string;

  @Column({ type: 'bool', default: false, nullable: true })
  isNeedToConfirm: boolean;

  @Column({ type: 'bool', default: false, nullable: true })
  isConfirm: boolean;

  @Column()
  callback: string;

  @Column({ type: 'bool', default: false })
  isRead: boolean;
}