
const express = require('express')


module.exports = (pool) => {

  const router = express.Router()


  router.post('/acesso', async (req, res) => {

    console.log('Chegou aqui na rota Acesso')
    const acesso = req.body
    console.log('entrou na rota Acesso com: ' + acesso.login + acesso.senha)

    try {

      const [usuarios] = await pool.query(`SELECT  nome, funcao, ativo FROM usuarios WHERE cpf = ? AND senha = ?`,
        [acesso.login, acesso.senha])

      if (usuarios.length > 0) {
        const usuario = usuarios[0]
        console.log(`Usuário ${usuario.nome} logado como ${usuario.funcao}`);

        if (usuario.ativo == '1') {
          return res.status(200).json({
            auth: true,
            funcao: usuario.funcao,
            nome: usuario.nome
          });
        } else {
          console.log('Usuario desativado.')
          return res.status(200).json({
            auth: false,
            funcao: usuario.funcao,
            nome: usuario.nome,
            message: 'Usuário desativado'

          });
        }
      } else {
        // Se não houver retorno do banco, as credenciais estão erradas
        return res.status(401).json({ auth: false, message: 'Login ou senha inválidos!' });
      }

    } catch (err) {
      console.log('Erro ao buscar o login no banco de dados: ' + err)

      return res.status(401).json({
        auth: false,
        message: 'CPF ou senha não encontrados!'
      });
    }

  })


  router.post('/newuser', async (req, res) => {


    try {

      console.log('entrou na rota para Novo Usuário')
      const novoUsuario = req.body


      const [usuarios] = await pool.query(`SELECT  nome, funcao, ativo FROM usuarios WHERE cpf = ?`,
        [novoUsuario.cpf])

      if (usuarios.length > 0) {
        const usuario = usuarios[0]
        console.log(`O cpf informado ja está cadastrado com o usuario ${usuario.nome}`);
        return res.status(200).json({ success: false, message: "Usuário ja existe." });

      }

      

      console.log('O usuario completo: ' + novoUsuario.cpf,
        novoUsuario.nome, novoUsuario.funcao, novoUsuario.ativo,
        novoUsuario.senha
      )

      //try {

      if (novoUsuario.senha == null) {
        return res.send('Senha Vazia!')
      }

      await pool.query(`INSERT INTO usuarios(
        cpf, nome, funcao, ativo, senha
        ) VALUES(?, ?, ?, ?, ?)`,
        [novoUsuario.cpf, novoUsuario.nome, novoUsuario.funcao,
        novoUsuario.ativo, novoUsuario.senha])

      res.status(200).json({ success: true, message: "Usuário Cadastrado!" });
      //res.status(201).json({ message: 'Usuário cadastrado!' })

    } catch (err) {
      console.log('entrou no catch do novo usuario:', err)
      res.status(500).json({ success: false, message: 'erro ao cadastrar novo usuario:' })
    }

  })


  router.post('/offuser', async (req, res) => {

    console.log('entrou na rota para Desativarar Usuário')
    const cpfUsuario = req.body.cpf

    console.log('O cpf do usuario : ' + cpfUsuario)

    try {

      await pool.query(`UPDATE usuarios
        SET ativo = false  WHERE cpf = ? `,
        [cpfUsuario])

      res.status(200).json({ success: true, message: "Usuário desativado com sucesso!" });
      //res.status(201).json({ message: 'Usuário Desativado!' })

    } catch (err) {
      console.log('entrou no catch da Desativação de usuario:', err)
      res.status(500).json({ message: 'erro ao Desativar usuario:' })
    }

  })


  router.post('/onuser', async (req, res) => {

    console.log('entrou na rota para Ativar Usuário')
    const cpfUsuario = req.body.cpf

    console.log('O cpf do usuario : ' + cpfUsuario)

    try {

      await pool.query(`UPDATE usuarios
        SET ativo = true  WHERE cpf = ? `,
        [cpfUsuario])

      res.status(200).json({ success: true, message: "Usuário ativado com sucesso!" });
      //res.status(201).json({ message: 'Usuário Ativado!' })

    } catch (err) {
      console.log('entrou no catch da Ativação de usuario:', err)
      res.status(500).json({ message: 'erro ao Ativar usuario:' })
    }

  })

  return router;

}

