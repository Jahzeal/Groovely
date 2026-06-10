import { Injectable, InternalServerErrorException } from '@nestjs/common';

@Injectable()
export class IpfsService {
  private readonly pinataJwt = process.env.PINATA_JWT;
  private readonly pinataApiKey = process.env.PINATA_API_KEY;
  private readonly pinataSecretApiKey = process.env.PINATA_API_SECRET;

  async uploadFile(
    fileBuffer: Buffer,
    fileName: string,
    mimeType: string,
  ): Promise<string> {
    // Check if Pinata keys are configured
    if (!this.pinataJwt && (!this.pinataApiKey || !this.pinataSecretApiKey)) {
      console.warn('⚠️ Pinata API keys are missing. Using mock IPFS gateway fallback.');
      const mockCid = 'Qm' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      return `ipfs://${mockCid}`;
    }

    try {
      const formData = new FormData();
      const blob = new Blob([fileBuffer], { type: mimeType });
      formData.append('file', blob, fileName);

      // Pinata options
      const metadata = JSON.stringify({
        name: fileName,
      });
      formData.append('pinataMetadata', metadata);

      const headers: Record<string, string> = {};
      if (this.pinataJwt) {
        headers['Authorization'] = `Bearer ${this.pinataJwt}`;
      } else {
        headers['pinata_api_key'] = this.pinataApiKey!;
        headers['pinata_secret_api_key'] = this.pinataSecretApiKey!;
      }

      const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Pinata upload failed with status ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      return `ipfs://${result.IpfsHash}`;
    } catch (error: any) {
      console.error('IPFS Upload Error:', error);
      throw new InternalServerErrorException(`IPFS upload failed: ${error.message}`);
    }
  }

  async uploadJson(json: any, name: string): Promise<string> {
    if (!this.pinataJwt && (!this.pinataApiKey || !this.pinataSecretApiKey)) {
      console.warn('⚠️ Pinata API keys are missing. Using mock IPFS JSON gateway fallback.');
      const mockCid = 'QmJSON' + Math.random().toString(36).substring(2, 15);
      return `ipfs://${mockCid}`;
    }

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (this.pinataJwt) {
        headers['Authorization'] = `Bearer ${this.pinataJwt}`;
      } else {
        headers['pinata_api_key'] = this.pinataApiKey!;
        headers['pinata_secret_api_key'] = this.pinataSecretApiKey!;
      }

      const body = {
        pinataContent: json,
        pinataMetadata: {
          name: name,
        },
      };

      const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Pinata JSON upload failed with status ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      return `ipfs://${result.IpfsHash}`;
    } catch (error: any) {
      console.error('IPFS JSON Upload Error:', error);
      throw new InternalServerErrorException(`IPFS JSON upload failed: ${error.message}`);
    }
  }
}
