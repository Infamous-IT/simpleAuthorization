const User = require('./models/User');
const Role = require('./models/Role');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { secret } = require('./config');
const { validationResult } = require('express-validator');

const generateAccessToken = (id, roles) => {
    const payload = {
        id,
        roles
    }
    return jwt.sign(payload, secret, { expiresIn: '24h' });
};
class authController {

    async registration(request, response) {
        try {
            const errors = validationResult(request);
            if (!errors.isEmpty()) {
                return response.status(400).json({ message: 'Registration error', errors })
            }

            const { username, password } = request.body;
            const person = await User.findOne({ username });

            if (person) {
                return response.status(400).json({ message: 'A user with the same name already exists!' });
            }
            const hashPassword = bcrypt.hashSync(password, 7);
            const userRole = await Role.findOne({ value: 'USER' });
            const user = new User({ username, password: hashPassword, roles: [userRole.value] });

            await user.save();
            return response.json({ message: 'User successfully registered' });

        } catch (error) {
            console.log(error);
            response.status(400).json({ message: 'Registration error' });
        }
    }

    async login(request, response) {
        try {
            const { username, password } = request.body;
            const user = await User.findOne({ username });
            if (!user) {
                return response.status(400).json({ message: `User ${username} not found!` });
            }

            const validPassword = bcrypt.compareSync(password, user.password);
            if (!validPassword) {
                return response.status(400).json({ message: `Password is wrong!` });
            }

            const token = generateAccessToken(user.__id, user.roles);
            return response.json({ token });
        } catch (error) {
            console.log(error);
            response.status(400).json({ message: 'Login error' });
        }
    }

    async getUsers(request, response) {
        try {
            const users = await User.find();
            response.json(users);
        } catch (error) {
            console.log(error.message);
        }
    }

    async getUserById(request, response) {
        try {
            const id = request.params.id;
            const user = await User.findById(id);
            return response.json(user);
        } catch (error) {
            console.log(error);
            response.status(400).json({ message: `User with this id was not found!` });
        }
    }

    async updateUser(request, response) {
        try {
            const id = request.params.id;
            const updatedName = request.body.username;
            const updatedRoles = request.body.roles;
            const newUser = {
                username: updatedName,
                roles: updatedRoles
            }
            const user = await User.findByIdAndUpdate({ _id: id }, newUser);
            return response.json(user);
        } catch (error) {
            console.log(error.message);
        }
    }

    async deleteUser(request, response) {
        try {
            const id = request.params.id;
            const user = await User.findByIdAndDelete(id);
            return response.json(user);
        } catch (error) {
            console.log(error.message);
        }
    }
}

module.exports = new authController();