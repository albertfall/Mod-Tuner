// This file contains the video-to-GIF conversion logic, including a
// client-side GIF encoder implementation. This allows for in-browser
// conversion without server-side processing or large external libraries.
// The encoder includes color quantization (NeuQuant) and LZW compression.

/*
 NeuQuant Neural-Net Image Quantization Algorithm
 ------------------------------------------
 Copyright (c) 1994 Anthony Dekker
 Ported to JavaScript by Johan Nordberg
 */
const ncycles = 100; // cycles for network settling
const netsize = 256; // number of colours ... 256
const maxnetpos = netsize - 1;
const netbiasshift = 4; // bias for colour values
const intbiasshift = 16; // bias for fractions
const intbias = 1 << intbiasshift;
const gammashift = 10;
const betashift = 10;
const beta = intbias >> betashift; /* = 1/1024 */
const betagamma = intbias << (gammashift - betashift);
const initrad = netsize >> 3; // for 256 cols, radius starts
const radiusbiasshift = 6; // at 32
const radiusbias = 1 << radiusbiasshift;
const initradius = initrad * radiusbias; // and decreases by a
const radiusdec = 30; // factor of 1/30 each cycle
const alphabiasshift = 10; // alpha starts at 1.0
const initalpha = 1 << alphabiasshift;
const radbiasshift = 8;
const radbias = 1 << radbiasshift;
const alpharadbshift = alphabiasshift + radbiasshift;
const alpharadbias = 1 << alpharadbshift;
const prime1 = 499;
const prime2 = 491;
const prime3 = 487;
const prime4 = 503;
const minpicturebytes = 3 * prime4;

class NeuQuant {
    private network: number[][];
    private netindex: Int32Array;
    private bias: Int32Array;
    private freq: Int32Array;
    private radpower: Int32Array;

    constructor(private thepicture: Uint8Array, private samplefac: number) {
        this.network = Array.from({ length: netsize }, () => new Array(3).fill(0));
        this.netindex = new Int32Array(256);
        this.bias = new Int32Array(netsize);
        this.freq = new Int32Array(netsize);
        this.radpower = new Int32Array(netsize >> 3);
        
        this.setUp();
    }

    private setUp() {
        for (let i = 0; i < netsize; i++) {
            this.network[i][0] = this.network[i][1] = this.network[i][2] = (i << (netbiasshift + 8)) / netsize;
            this.freq[i] = intbias / netsize;
            this.bias[i] = 0;
        }
    }

    public colorMap() {
        const map = [];
        const index = new Array(netsize);
        for (let i = 0; i < netsize; i++) index[this.network[i][3]] = i;
        let k = 0;
        for (let i = 0; i < netsize; i++) {
            const j = index[i];
            map[k++] = this.network[j][0];
            map[k++] = this.network[j][1];
            map[k++] = this.network[j][2];
        }
        return map;
    }

    private unbiasnet() {
        for (let i = 0; i < netsize; i++) {
            this.network[i][0] >>= netbiasshift;
            this.network[i][1] >>= netbiasshift;
            this.network[i][2] >>= netbiasshift;
            this.network[i][3] = i; // record color number
        }
    }

    private altersingle(alpha: number, i: number, b: number, g: number, r: number) {
        this.network[i][0] -= (alpha * (this.network[i][0] - b)) / initalpha;
        this.network[i][1] -= (alpha * (this.network[i][1] - g)) / initalpha;
        this.network[i][2] -= (alpha * (this.network[i][2] - r)) / initalpha;
    }

    private alterneigh(radius: number, i: number, b: number, g: number, r: number) {
        let lo = Math.abs(i - radius);
        let hi = Math.min(i + radius, netsize);
        let j = i + 1;
        let k = i - 1;
        let m = 1;
        while (j < hi || k > lo) {
            const a = this.radpower[m++];
            if (j < hi) {
                const p = this.network[j++];
                p[0] -= (a * (p[0] - b)) / alpharadbias;
                p[1] -= (a * (p[1] - g)) / alpharadbias;
                p[2] -= (a * (p[2] - r)) / alpharadbias;
            }
            if (k > lo) {
                const p = this.network[k--];
                p[0] -= (a * (p[0] - b)) / alpharadbias;
                p[1] -= (a * (p[1] - g)) / alpharadbias;
                p[2] -= (a * (p[2] - r)) / alpharadbias;
            }
        }
    }

    private contest(b: number, g: number, r: number) {
        let bestd = ~(1 << 31);
        let bestbiasd = bestd;
        let bestpos = -1;
        let bestbiaspos = bestpos;
        for (let i = 0; i < netsize; i++) {
            const n = this.network[i];
            let dist = Math.abs(n[0] - b) + Math.abs(n[1] - g) + Math.abs(n[2] - r);
            if (dist < bestd) {
                bestd = dist;
                bestpos = i;
            }
            const biasdist = dist - (this.bias[i] >> (intbiasshift - netbiasshift));
            if (biasdist < bestbiasd) {
                bestbiasd = biasdist;
                bestbiaspos = i;
            }
            const betafreq = this.freq[i] >> betashift;
            this.freq[i] -= betafreq;
            this.bias[i] += betafreq << gammashift;
        }
        this.freq[bestpos] += beta;
        this.bias[bestpos] -= betagamma;
        return bestbiaspos;
    }

    private inxbuild() {
        let previouscol = 0;
        let startpos = 0;
        for (let i = 0; i < netsize; i++) {
            const p = this.network[i];
            let smallpos = i;
            let smallval = p[1];
            let q;
            for (let j = i + 1; j < netsize; j++) {
                q = this.network[j];
                if (q[1] < smallval) {
                    smallpos = j;
                    smallval = q[1];
                }
            }
            q = this.network[smallpos];
            if (i !== smallpos) {
                [p[0], q[0]] = [q[0], p[0]];
                [p[1], q[1]] = [q[1], p[1]];
                [p[2], q[2]] = [q[2], p[2]];
                [p[3], q[3]] = [q[3], p[3]];
            }
            if (smallval !== previouscol) {
                this.netindex[previouscol] = (startpos + i) >> 1;
                for (let j = previouscol + 1; j < smallval; j++) this.netindex[j] = i;
                previouscol = smallval;
                startpos = i;
            }
        }
        this.netindex[previouscol] = (startpos + maxnetpos) >> 1;
        for (let j = previouscol + 1; j < 256; j++) this.netindex[j] = maxnetpos;
    }

    public learn() {
        let lengthcount = this.thepicture.length;
        const alphadec = 30 + (this.samplefac - 1) / 3;
        const samplepixels = lengthcount / (3 * this.samplefac);
        let delta = samplepixels / ncycles | 0;
        let alpha = initalpha;
        let radius = initradius;
        let rad = radius >> radiusbiasshift;
        if (rad <= 1) rad = 0;
        for (let i = 0; i < rad; i++) this.radpower[i] = alpha * (((rad * rad - i * i) * radbias) / (rad * rad));
        
        let step = lengthcount < minpicturebytes ? 3 : (lengthcount % prime1 !== 0) ? 3 * prime1 : (lengthcount % prime2 !== 0) ? 3 * prime2 : (lengthcount % prime3 !== 0) ? 3 * prime3 : 3 * prime4;
        
        let pix = 0;
        let i = 0;
        while (i < samplepixels) {
            const b = (this.thepicture[pix] & 0xff) << netbiasshift;
            const g = (this.thepicture[pix + 1] & 0xff) << netbiasshift;
            const r = (this.thepicture[pix + 2] & 0xff) << netbiasshift;
            const j = this.contest(b, g, r);
            this.altersingle(alpha, j, b, g, r);
            if (rad) this.alterneigh(rad, j, b, g, r);
            pix += step;
            if (pix >= lengthcount) pix -= lengthcount;
            i++;
            if (delta === 0) delta = 1;
            if (i % delta === 0) {
                alpha -= alpha / alphadec;
                radius -= radius / radiusdec;
                rad = radius >> radiusbiasshift;
                if (rad <= 1) rad = 0;
                for (let j = 0; j < rad; j++) this.radpower[j] = alpha * (((rad * rad - j * j) * radbias) / (rad * rad));
            }
        }
        
    }

    public buildColormap() {
        this.learn();
        this.unbiasnet();
        this.inxbuild();
    }

    public getNetIndex(b: number, g: number, r: number) {
        let a, bestd = 1000, best = -1;
        let i = this.netindex[g];
        let j = i - 1;
        while (i < netsize || j >= 0) {
            if (i < netsize) {
                const p = this.network[i];
                let dist = p[1] - g;
                if (dist >= bestd) i = netsize;
                else {
                    i++;
                    if (dist < 0) dist = -dist;
                    a = p[0] - b;
                    if (a < 0) a = -a;
                    dist += a;
                    if (dist < bestd) {
                        a = p[2] - r;
                        if (a < 0) a = -a;
                        dist += a;
                        if (dist < bestd) {
                            bestd = dist;
                            best = p[3];
                        }
                    }
                }
            }
            if (j >= 0) {
                const p = this.network[j];
                let dist = g - p[1];
                if (dist >= bestd) j = -1;
                else {
                    j--;
                    if (dist < 0) dist = -dist;
                    a = p[0] - b;
                    if (a < 0) a = -a;
                    dist += a;
                    if (dist < bestd) {
                        a = p[2] - r;
                        if (a < 0) a = -a;
                        dist += a;
                        if (dist < bestd) {
                            bestd = dist;
                            best = p[3];
                        }
                    }
                }
            }
        }
        return best;
    }
}

class LZWEncoder {
    private EOF = -1;
    private BITS = 12;
    private HSIZE = 5003;
    private masks = [0x0000, 0x0001, 0x0003, 0x0007, 0x000f, 0x001f, 0x003f, 0x007f, 0x00ff, 0x01ff, 0x03ff, 0x07ff, 0x0fff, 0x1fff, 0x3fff, 0x7fff, 0xffff];
    
    private imgW: number;
    private imgH: number;
    private pixAry: Uint8Array;
    private initCodeSize: number;
    private remaining = 0;
    private curPixel = 0;
    private n_bits = 0;
    private maxcode = 0;
    private free_ent = 0;
    private clear_flg = false;
    private g_init_bits = 0;
    private ClearCode = 0;
    private EOFCode = 0;
    
    private cur_accum = 0;
    private cur_bits = 0;
    private htab = new Int32Array(this.HSIZE);
    private codetab = new Int32Array(this.HSIZE);
    private a_count = 0;
    private accum = new Uint8Array(256);

    constructor(width: number, height: number, pixels: Uint8Array, color_depth: number) {
        this.imgW = width;
        this.imgH = height;
        this.pixAry = pixels;
        this.initCodeSize = Math.max(2, color_depth);
    }
    
// FIX: Changed outs from Uint8Array to number[] as Uint8Array does not have a push method.
    private char_out(c: number, outs: number[]) {
        this.accum[this.a_count++] = c;
        if (this.a_count >= 254) this.flush_char(outs);
    }

// FIX: Changed outs from Uint8Array to number[] as Uint8Array does not have a push method.
    private cl_block(outs: number[]) {
        this.cl_hash(this.HSIZE);
        this.free_ent = this.ClearCode + 2;
        this.clear_flg = true;
        this.output(this.ClearCode, outs);
    }

    private cl_hash(hsize: number) {
        for (let i = 0; i < hsize; ++i) this.htab[i] = -1;
    }

// FIX: Changed outs from Uint8Array to number[] as Uint8Array does not have a push method.
    private compress(init_bits: number, outs: number[]) {
        let fcode, c, i, ent, disp, hsize_reg, hshift;
        this.g_init_bits = init_bits;
        this.clear_flg = false;
        this.n_bits = this.g_init_bits;
        this.maxcode = this.MAXCODE(this.n_bits);
        this.ClearCode = 1 << (init_bits - 1);
        this.EOFCode = this.ClearCode + 1;
        this.free_ent = this.ClearCode + 2;
        this.a_count = 0;
        ent = this.next_pixel();
        hshift = 0;
        for (fcode = this.HSIZE; fcode < 65536; fcode *= 2) ++hshift;
        hshift = 8 - hshift;
        hsize_reg = this.HSIZE;
        this.cl_hash(hsize_reg);
        this.output(this.ClearCode, outs);
        outer_loop: while ((c = this.next_pixel()) !== this.EOF) {
            fcode = (c << this.BITS) + ent;
            i = (c << hshift) ^ ent;
            if (this.htab[i] === fcode) {
                ent = this.codetab[i];
                continue;
            } else if (this.htab[i] >= 0) {
                disp = hsize_reg - i;
                if (i === 0) disp = 1;
                do {
                    if ((i -= disp) < 0) i += hsize_reg;
                    if (this.htab[i] === fcode) {
                        ent = this.codetab[i];
                        continue outer_loop;
                    }
                } while (this.htab[i] >= 0);
            }
            this.output(ent, outs);
            ent = c;
            if (this.free_ent < 1 << this.BITS) {
                this.codetab[i] = this.free_ent++;
                this.htab[i] = fcode;
            } else this.cl_block(outs);
        }
        this.output(ent, outs);
        this.output(this.EOFCode, outs);
    }

// FIX: Changed outs from Uint8Array to number[] to allow use of push and match caller type.
    public encode(outs: number[]) {
        outs.push(this.initCodeSize);
        this.remaining = this.imgW * this.imgH;
        this.curPixel = 0;
        this.compress(this.initCodeSize + 1, outs);
        outs.push(0);
    }

// FIX: Changed outs from Uint8Array to number[] as Uint8Array does not have a push method.
    private flush_char(outs: number[]) {
        if (this.a_count > 0) {
            outs.push(this.a_count);
            for (let i = 0; i < this.a_count; i++) outs.push(this.accum[i]);
            this.a_count = 0;
        }
    }

    private MAXCODE(n_bits: number) {
        return (1 << n_bits) - 1;
    }

    private next_pixel() {
        if (this.remaining === 0) return this.EOF;
        --this.remaining;
        const pix = this.pixAry[this.curPixel++];
        return pix & 0xff;
    }

// FIX: Changed outs from Uint8Array to number[] as Uint8Array does not have a push method.
    private output(code: number, outs: number[]) {
        this.cur_accum &= this.masks[this.cur_bits];
        if (this.cur_bits > 0) this.cur_accum |= code << this.cur_bits;
        else this.cur_accum = code;
        this.cur_bits += this.n_bits;
        while (this.cur_bits >= 8) {
            this.char_out(this.cur_accum & 0xff, outs);
            this.cur_accum >>= 8;
            this.cur_bits -= 8;
        }
        if (this.free_ent > this.maxcode || this.clear_flg) {
            if (this.clear_flg) {
                this.maxcode = this.MAXCODE((this.n_bits = this.g_init_bits));
                this.clear_flg = false;
            } else {
                ++this.n_bits;
                if (this.n_bits === this.BITS) this.maxcode = 1 << this.BITS;
                else this.maxcode = this.MAXCODE(this.n_bits);
            }
        }
        if (code === this.EOFCode) {
            while (this.cur_bits > 0) {
                this.char_out(this.cur_accum & 0xff, outs);
                this.cur_accum >>= 8;
                this.cur_bits -= 8;
            }
            this.flush_char(outs);
        }
    }
}

class GIFEncoder {
    private width: number;
    private height: number;
    private delay = 0;
    private transparent: number | null = null;
    private repeat = -1; // -1 for no repeat, 0 for forever
    private frames: Uint8Array[] = [];
    private out: number[] = [];
    private colorDepth: number = 0;
    private palSize = 7;
    private colorTab: number[] = [];

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
    }

    public addFrame(imageData: ImageData) {
        const pixels = this.getPixels(imageData);
        this.analyzePixels(pixels);
        if (this.frames.length === 0) {
          this.writeLSD();
          this.writePalette();
          if (this.repeat >= 0) this.writeNetscapeExt();
        }
        this.writeGraphicCtrlExt();
        this.writeImageDesc();
        this.writePixels(pixels);
        this.frames.push(pixels);
    }

    public finish(): Blob {
        this.out.push(0x3b); // trailer
        return new Blob([new Uint8Array(this.out)], { type: 'image/gif' });
    }

    public setDelay(ms: number) {
        this.delay = Math.round(ms / 10);
    }
    
    public setRepeat(repeat: number) {
        this.repeat = repeat;
    }

    private getPixels(imageData: ImageData) {
        const { width, height, data } = imageData;
        const pixels = new Uint8Array(width * height);
        const count = width * height;
        for (let i = 0; i < count; i++) {
          const r = data[i * 4];
          const g = data[i * 4 + 1];
          const b = data[i * 4 + 2];
          pixels[i] = this.quantizer!.getNetIndex(b, g, r);
        }
        return pixels;
    }
    
    private quantizer: NeuQuant | null = null;

    private analyzePixels(pixels: Uint8Array) {
        const len = pixels.length;
        const nPix = len / 3;
        this.quantizer = new NeuQuant(pixels, 1);
        this.quantizer.buildColormap();
        this.colorTab = this.quantizer.colorMap();
    }

    private writeUTF(s: string) {
        for (let i = 0; i < s.length; i++) this.out.push(s.charCodeAt(i));
    }
    
    private write(b: number) {
        this.out.push(b);
    }

    private writeLSD() {
        this.writeUTF('GIF89a');
        this.write(this.width & 0xff);
        this.write((this.width >> 8) & 0xff);
        this.write(this.height & 0xff);
        this.write((this.height >> 8) & 0xff);
        this.write(0x80 | 0x70 | 0x00 | this.palSize);
        this.write(0); // background color index
        this.write(0); // pixel aspect ratio
    }
    
    private writePalette() {
        this.out.push(...this.colorTab);
        const n = (3 * 256) - this.colorTab.length;
        for (let i = 0; i < n; i++) this.out.push(0);
    }
    
    private writeNetscapeExt() {
        this.write(0x21); // extension introducer
        this.write(0xff); // app extension label
        this.write(11);
        this.writeUTF('NETSCAPE2.0');
        this.write(3);
        this.write(1);
        this.write(this.repeat & 0xff);
        this.write((this.repeat >> 8) & 0xff);
        this.write(0); // block terminator
    }
    
    private writeGraphicCtrlExt() {
        this.write(0x21); // extension introducer
        this.write(0xf9); // GCE label
        this.write(4);
        let transp, disp;
        if (this.transparent === null) {
            transp = 0;
            disp = 0; // no disposal specified
        } else {
            transp = 1;
            disp = 2; // restore to background
        }
        this.write(disp << 2 | transp);
        this.write(this.delay & 0xff);
        this.write((this.delay >> 8) & 0xff);
        this.write(this.transparent !== null ? this.transparent : 0);
        this.write(0);
    }
    
    private writeImageDesc() {
        this.write(0x2c);
        this.write(0);
        this.write(0);
        this.write(0);
        this.write(0);
        this.write(this.width & 0xff);
        this.write((this.width >> 8) & 0xff);
        this.write(this.height & 0xff);
        this.write((this.height >> 8) & 0xff);
        this.write(0);
    }
    
    private writePixels(pixels: Uint8Array) {
        const enc = new LZWEncoder(this.width, this.height, pixels, this.palSize + 1);
        enc.encode(this.out);
    }
}


/**
 * Converts a video file (from a URL) to an animated GIF.
 * @param videoUrl The URL of the video to convert.
 * @param onProgress A callback function to report progress (0 to 1).
 * @returns A Promise that resolves with the generated GIF as a Blob.
 */
export const convertVideoToGif = (
    videoUrl: string,
    onProgress: (progress: number) => void
): Promise<Blob> => {
    return new Promise((resolve, reject) => {
        const video = document.createElement('video');
        video.crossOrigin = "anonymous";
        video.muted = true;
        
        const canvas = document.createElement('canvas');
        let ctx: CanvasRenderingContext2D | null = null;
        let encoder: GIFEncoder | null = null;

        const FPS = 15;
        const frameInterval = 1 / FPS;
        let currentTime = 0;
        let seeking = false;

        video.addEventListener('loadedmetadata', () => {
            canvas.width = video.videoWidth > 480 ? 480 : video.videoWidth;
            canvas.height = Math.round(canvas.width * (video.videoHeight / video.videoWidth));
            
            ctx = canvas.getContext('2d');
            if (!ctx) {
                return reject(new Error("Could not get canvas context"));
            }
            
            encoder = new GIFEncoder(canvas.width, canvas.height);
            encoder.setRepeat(0); // 0 for forever
            encoder.setDelay(1000 / FPS);

            video.currentTime = 0;
            seeking = true;
        });

        const captureFrame = () => {
             if (!ctx || !encoder || !video.duration) return;

            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            
            if (currentTime === 0) {
              // Analyze pixels and write header on first frame
              const pixels = new Uint8Array(imageData.data.buffer);
              encoder['analyzePixels'](pixels);
              encoder['writeLSD']();
              encoder['writePalette']();
              if (encoder['repeat'] >= 0) encoder['writeNetscapeExt']();
            }

            // Get indexed pixels and add frame
            const indexedPixels = encoder['getPixels'](imageData);
            encoder['writeGraphicCtrlExt']();
            encoder['writeImageDesc']();
            encoder['writePixels'](indexedPixels);

            onProgress(currentTime / video.duration);

            currentTime += frameInterval;

            if (currentTime < video.duration) {
                video.currentTime = currentTime;
                seeking = true;
            } else {
                try {
                    const gifBlob = encoder.finish();
                    resolve(gifBlob);
                } catch (err) {
                    reject(err);
                }
            }
        }

        video.addEventListener('seeked', () => {
            if (seeking) {
                seeking = false;
                captureFrame();
            }
        });

        video.addEventListener('error', (e) => {
            reject(new Error("Failed to load video for GIF conversion."));
        });

        // Use a cache-busting parameter to avoid CORS issues with cached resources
        video.src = `${videoUrl}${videoUrl.includes('?') ? '&' : '?'}cacheBust=${new Date().getTime()}`;
        video.load();
    });
};