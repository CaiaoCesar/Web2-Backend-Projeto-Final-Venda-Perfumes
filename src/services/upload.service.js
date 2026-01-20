// src/services/upload.service.js
import { UploadClient } from "@uploadcare/upload-client";

const clientUploadcare = new UploadClient({
    publicKey: process.env.UPLOADCARE_PUBLIC_KEY,
});

/**
 * @param {Buffer} fileBuffer - Buffer do arquivo a ser enviado
 * @param {string} fileName - Nome do arquivo
 * @param {string} mimeType - Tipo MIME do arquivo a ser enviado (ex: 'image/jpeg')
 * @returns {Promise<string>} URL do arquivo enviado
 */
export const uploadImgUploadcare = async (fileBuffer, fileName, mimeType) => {
    try {
        if (!fileBuffer || fileBuffer.length === 0) {
            throw new Error('Arquivo inválido ou vazio');
        }

        if (!process.env.UPLOADCARE_PUBLIC_KEY) {
            throw new Error('Chave pública (UPLOADCARE_PUBLIC_KEY) do Uploadcare não está configurada nas variáveis de ambiente.');
        }

        console.log('Iniciando upload do arquivo para o Uploadcare:', {
            fileName,
            mimeType,
            size: `${(fileBuffer.length / 1024).toFixed(2)} KB`, // FIX: toFixed estava fora do lugar
        });

        const arquivo = await clientUploadcare.uploadFile(fileBuffer, {
            fileName: fileName, 
            contentType: mimeType,
            store: '1', // '1' força armazenamento imediato, 'auto' pode deixar temporário
        });

        // FIX: Era 'file.uuid' mas a variável é 'arquivo'
        const urlCdnUploadcare = `https://ucarecdn.com/${arquivo.uuid}/`;
        console.log("Upload concluído com sucesso:", urlCdnUploadcare);

        return urlCdnUploadcare;
    } catch (error) {
        console.error('Erro no upload:', error);
        throw new Error(`Falha ao fazer o upload da imagem: ${error.message}`);
    }
};

/** 
 * Deleta um arquivo do Uploadcare
 * @param {string} fileId - UUID do arquivo do UploadCare
 * @returns {Promise<boolean>} Se foi apagado retorna True
 */
export const apagaDoUploadCare = async (fileId) => {
    try {
        console.log("Deleção ainda não implementada:", fileId);
        // TODO: Implementar usando DeleteFileCommand do Uploadcare REST API
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