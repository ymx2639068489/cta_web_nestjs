import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { User } from '../users';

@Entity()
export class journalism extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;
  
  @JoinColumn()
  @ManyToOne(() => User)
  author: User;

  @Column()
  title: string;

  @Column({ type: 'longtext' })
  content: string;

  @Column({ type: 'bool', default: false })
  isApprove: boolean;
}