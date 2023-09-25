import { Table, Column, Model, DataType, CreatedAt, UpdatedAt } from "sequelize-typescript"

@Table({
    timestamps: true,
    tableName: "users",
    modelName: "User"
})
class User extends Model {
    @Column({
        primaryKey: true,
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4
    })
    declare id: string

    @Column({ type: DataType.STRING, allowNull: false })
    declare first_name: string
    @Column({ type: DataType.STRING, })
    declare last_name: string
    @Column({
        type: DataType.STRING, allowNull: false, unique: true,
        validate: {
            isEmail: {
                msg: "must be a valid email address"
            }
        }
    })
    declare email: string
    @Column({ type: DataType.STRING, allowNull: false })
    declare password: string
    @CreatedAt
    declare created_at: Date
    @UpdatedAt
    declare updated_at: Date
}

export default User;