

require('dotenv').config(); // ESSA LINHA DEVE SER A PRIMEIRA DE TODAS

const express = require('express')

/**PARA UPLOAD DAS IMAGENS */
const fileUpload = require('express-fileupload')



/////////////////////
/**Para Novas ROtas */

const viagemRouter = require('./routes/ViagemRouter')
const usuariosRouter = require('./routes/UsuariosRouter')


const app = express()
const port = 3000

const cors = require('cors')
app.use(cors())

app.use(express.json({ limit: '20mb' }))


const formatarData = (data) => {

  try {

    if (!data) return null;

    const [auxdia, auxmes, auxano] = data.split('/');
    let dia = parseInt(auxdia)
    let mes = parseInt(auxmes)
    let ano = parseInt(auxano)

    if (isNaN(dia)) return null

    return `${ano}-${mes}-${dia}`;
  } catch {
    console.log('Alguma data ta vazia ou com letras')
  }

}

/**PARA OS CAMPOS DECIMAIS DA TABELA VIAGENS
 * COMO LATITUDE, LONGITUDE E VALOR
 */
const parseDecimal = (v) => {
  if (v === undefined || v === null) return null;

  const cleaned = String(v).trim();
  if (cleaned === '') return null;

  const n = Number(cleaned.replace(',', '.'));
  return isNaN(n) ? null : n;
};

/** CONEXÃO COM BANCO DE DADOS **/
///////////////////////////////////////////////////////

const { pool } = require('./conexaoBd');
//const UsuariosRouter = require('./routes/UsuariosRouter');


app.get('/', (req, res) => {
  res.send('Rota Base')
})

//////////////////////////////////////////////////////////////////////////
///////////////////////NOVAS ROTAS//////////////////////////

app.use('/viagem', viagemRouter(pool, formatarData, parseDecimal))

app.use('/usuarios', usuariosRouter(pool))


app.listen(port, () => {
  (`Servidor rodando em http://localhost:${port}`)
})

