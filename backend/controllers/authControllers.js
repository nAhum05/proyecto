//Recibe la petición del formulario, valida la existencia del usuario, 
//genera el hash de la contraseña usando bcryptjs y la almacena.
const User = require('../models/user');
const bcrypt = require('bcryptjs');

exports.register = async (req, res) => {
  try {
    const { firstName, lastName, birthDate, email, password } = req.body;

    // 1. Verificar si el correo ya existe en la base de datos
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'El correo electrónico ya está registrado.' });
    }

    // 2. Generar el Hash de la contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Crear el nuevo usuario con la contraseña ya encriptada
    const newUser = new User({
      firstName,
      lastName,
      birthDate,
      email,
      password: hashedPassword
    });

    // 4. Guardar en MongoDB
    await newUser.save();
    res.status(201).json({ message: 'Usuario registrado.' });

  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'usuario no encontrado' });
    }

    // 2. Comparar el hash de mongo
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'contrasena incorrecta' });
    }

    // 3. Responder al frontend si todo coincide
    res.status(200).json({
      message: 'Inicio de sesión exitoso.',
      user: {
        id: user._id,
        firstName: user.firstName,
        email: user.email
      }
    });

  } catch (error) {
    res.status(500).json({ message: 'Error server', error: error.message });
  }
};