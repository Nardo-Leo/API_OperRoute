const { google } = require('googleapis');
const { Readable } = require('stream');

// Configura o acesso com suas chaves do google

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
);


// Define a credencial que nunca expira
oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN
});

const drive = google.drive({ version: 'v3', auth: oauth2Client });

const uploadBase64 = async (base64String, fileName) => {
    try {
        //const folderId = '1SQyRfLiLNF1idv3ZyZSjWl3DfXrJAt0y'; //  URL da Pasta do Drive
        const folderId = process.env.FOLDER_ID

        const pureBase64 = base64String.split(',')[1];
        const buffer = Buffer.from(pureBase64, 'base64');
        const bufferStream = new Readable();
        bufferStream.push(buffer);
        bufferStream.push(null);

        // Faz o upload usando a sua conta de 2TB
        const response = await drive.files.create({
            requestBody: {
                name: fileName,
                parents: [folderId],
            },
            media: {
                mimeType: 'image/png',
                body: bufferStream,
            },
            fields: 'id',
        });

        // Cria a permissão de visualização (igual ao seu código antigo)
        await drive.permissions.create({
            fileId: response.data.id,
            requestBody: {
                role: 'reader',
                type: 'anyone',
            },
        });

        console.log(`✅ Assinatura enviada! ID: ${response.data.id}`);
        return `https://drive.google.com/uc?id=${response.data.id}`;

    } catch (error) {

        // Isso vai mostrar se o erro é 'invalid_client', 'invalid_grant' ou 'bad_request'
        console.error('❌ ERRO AO SALVAR NO GOOGLE:', error.response ? error.response.data : error.message);
        throw new Error('Erro ao salvar no Google Drive');

        
    }
};

module.exports = { uploadBase64 };