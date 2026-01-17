import { UploadClient } from "@uploadcare/upload-client";
import { file } from "zod/v4";

const clientUploadcare = new UploadClient({
    publicKey: process.env.UPLOADCARE_PUBLIC_KEY,
});

/**
 * @param {Buffer} fileBuffer - Buffer do arquivo a ser enviado
 * @param {string} fileName - Nome do arquivo
 * @param {string} mimeType - Tipo MIME do arquivo a ser enviado (ex: 'image/jpeg')
 * @returns {Promise<string>} URL do arquivo enviado
 *
 */

export const uploadImgUploadcare = async (fileBuffer, fileName, mimeType) => {
    try {
        if (!fileBuffer || fileBuffer.length === 0 ) {
            throw new Error('Arquivo inválido ou vazio');
        }

        if (!process.env.UPLOADCARE_PUBLIC_KEY) {
            throw new Error('Chave pública (UPLOADCARE_PUBLIC_KEY) do Uploadcare não está configurada nas váriaveis de ambiente.');
        }

        console.log('Iniciando upload do arquivo para o Uploadcare:', {
            fileName,
            mimeType,
            size: `${fileBuffer.length / 1024}.toFixed(2) KB`,
        });

        const arquivo = await clientUploadcare.uploadFile(fileBuffer, {
            fileName: fileName, 
            contentType: mimeType,
            store: 'auto',
        });

        const urlCdnUploadcare = `https://ucarecdn.com/${file.uuid}/`;
        console.log("Upload concluído com sucesso: ", urlCdnUploadcare);

        return urlCdnUploadcare;
    } catch (error) {
        throw new Error(`Falha ao fazer o upload da imagem: ${error.message}`, [
            { field: 'foto', message: error.message },
        ]);
    }
};

/** 
 * Caso dê erro o arquivo do Uploadcare é apagado
 * @param {string} fileId - UUID do arquivo do UploadCare
 * @returns {Promise<boolean>} Se foi apagado retorna True
 */

export const apagaDoUploadCare = async fileId => {
    try {
        console.log("Deleção ainda não implementada:", fileId);
        return false;
    } catch (error) {
        console.error("Erro ao deletar arquivo:", error);
        return false;
    }
};

export default {
    uploadImgUploadcare,
    apagaDoUploadCare,
}
