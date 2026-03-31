

const express = require('express')

const driveService = require('../services/driveServices');

module.exports = (pool, formatarData, parseDecimal) => {

    const router = express.Router()





    router.post('/upload', async (req, res) => {
        const viagens = req.body;

        console.log('Entrou aqui /upload')


        try {
            const valores = viagens.map(v => [
                v.cod_viagem,
                v.carga,
                formatarData(v.data_cadastro),
                formatarData(v.data_venda),
                formatarData(v.data_faturamento),
                v.placa,
                v.motorista,
                v.cod_cliente,
                v.cliente,
                v.fone,
                v.contato,
                v.municipio,
                v.uf,
                v.endereco,
                v.bairro,
                v.numero,
                parseDecimal(v.latitude),
                parseDecimal(v.longitude),
                v.numero_do_pedido,
                v.nf,
                parseDecimal(v.valor),
                v.formapgto,
                v.observacoes,
                v.cod_vendedor,
                v.vendedor,
                v.peso,
                v.stts_viagem
            ]);



            await valores.map((linha, index) => {
                pool.query(`
      INSERT INTO viagens (
      cod_viagem, carga, data_cadastro, data_venda,
      data_faturamento, 
      placa, motorista, cliente, fone, contato
       municipio, uf, endereco, bairro, numero, 
       valor, latitude, longitude, numero_do_pedido,
       nf, valor
      formapgto, observacoes, cod_vendedor,
      vendedor, peso, stts_viagem
      )
      VALUES(?)
    `, [valores[index]])

            })
            res.status(200).json({ success: true, message: "Viagem Cadastrada!" });
            //res.status(201).json({ message: 'Viagens cadastradas com sucesso' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Erro ao cadastrar viagens' });
        }


    });


    router.post('/busca', async (req, res) => {
        console.log('Entrou aqui na /busca')

        let cod_viagem = Number(req.body.num_viagem)

        const [rows] = await pool.query(`SELECT * FROM viagens where cod_viagem = ? `, [cod_viagem])

        res.json(rows)




    })

    router.post('/editaMotorista', async (req, res) => {

        console.log('Entrou aqui no /editaMotorista')

        try {
            let attViagem = Number(req.body.viagem.cod)
            let attMotorista = req.body.viagem.motorista
            const sql = await pool.query(`UPDATE viagens SET motorista = ? WHERE cod_viagem = ?`,
                [attMotorista, attViagem]
            )

            res.status(200).json({
                success: true,
                message: 'Motorista atualizado com sucesso',
                result: sql
            })

        } catch (error) {
            console.error(error)
            res.status(500).json({
                success: false,
                message: 'Erro ao atualizar motorista',
                error: error.message
            })
        }



    })

    router.post('/editaPlaca', async (req, res) => {

        console.log('Entrou aqui no edita placa')

        try {
            let attViagem = Number(req.body.viagem.cod)
            let attPlaca = req.body.viagem.placa
            const sql = await pool.query(`UPDATE viagens SET placa = ? WHERE cod_viagem = ?`,
                [attPlaca, attViagem]
            )

            res.status(200).json({
                success: true,
                message: 'Placa do veiculo atualizada com sucesso',
                result: sql
            })

        } catch (error) {
            console.error(error)
            res.status(500).json({
                success: false,
                message: 'Erro ao atualizar Placa do veiculo',
                error: error.message
            })
        }



    })

    router.post('/finalizar', async (req, res) => {

        try {

            console.log('Entrou na /finalizar')

            const { cod_viagem, carga, forma_pagamento, foto, destinatarioId, assinatura } = req.body;



            //  Ver se os dados chegaram
            if (!cod_viagem || !carga || !foto || !destinatarioId || !assinatura) {
                return res.status(400).json({ error: "Dados incompletos para finalizar" });
            }


            /*  Chamar o serviço do Google Drive para upload e 
            passar o Base64 e um nome pro arquivo*/

            const urlFoto = await driveService.uploadBase64(foto, `Comprovante_${carga}_${cod_viagem}.png`);
            const urlDestinatarioId = await driveService.uploadBase64(destinatarioId, `RG_${carga}.png`);
            const urlAssinatura = await driveService.uploadBase64(assinatura, `assinatura_${carga}_${cod_viagem}.png`);

            // Atualizar o MySQL com os links e o status
            const [result] = await pool.query(`
            UPDATE viagens 
            SET 
                formapgto = ?, 
                url_img_um = ?,
                url_img_dois = ?, 
                ass_dest = ?, 
                stts_viagem = 'Concluída' 
            WHERE cod_viagem = ? AND carga = ?`,
                [
                    forma_pagamento,
                    urlFoto,        // enviado para url_img_um
                    urlDestinatarioId,
                    urlAssinatura,   // enviado para ass_dest
                    cod_viagem,
                    carga
                ]
            );

            // Verificamos se alguma linha foi de fato afetada
            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Carga não encontrada para esta viagem."
                });
            }

            res.status(200).json({ success: true, message: "Entrega concluída com sucesso!" });

        } catch (error) {
            console.error("Erro na rota finalizar:", error);
            res.status(500).json({ success: false, error: error.message });
        }


    })

    return router
}
