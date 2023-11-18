import { Entity, CreateDateColumn, UpdateDateColumn, Column, PrimaryColumn } from "typeorm"

@Entity()
export class User {
    @PrimaryColumn()
    id: string

    @Column()
    name: string

    @Column()
    email: string

    @Column()
    googleId: string //topcional

    @Column()
    fcmToken: string

    @Column({nullable: true})
    imageUrl: string

    @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)" })
    public created_at: Date;

    @UpdateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)", onUpdate: "CURRENT_TIMESTAMP(6)" })
    public updated_at: Date;
}
