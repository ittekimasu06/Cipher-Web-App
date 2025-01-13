function caesarCipher(str, shift, encode = true) {
    if (!encode) shift = (26 - shift) % 26;
    return str.replace(/[a-z]/gi, char => {
        const start = char <= 'Z' ? 65 : 97;
        return String.fromCharCode((char.charCodeAt(0) - start + shift) % 26 + start);
    });
}

function affineCipher(str, a, b, encode = true) {
    const m = 26;

    const modInverse = (a, m) => {
        for (let x = 1; x < m; x++) {
            if ((a * x) % m === 1) return x;
        }
        throw new Error('Giá trị của a phải là nghịch đảo của 26');
    };

    if (!encode) a = modInverse(a, m);

    return str.replace(/[a-z]/gi, char => {
        const isUpperCase = char <= 'Z';
        const start = isUpperCase ? 65 : 97;
        const x = char.charCodeAt(0) - start;

        const result = encode
            ? (a * x + b) % m
            : ((x - b) * a + m * 26) % m; 
        return String.fromCharCode(start + result);
    });
}

function vigenereCipher(str, keyword, encode = true) {
    const m = 26;
    keyword = keyword.toLowerCase();
    let keywordIndex = 0;

    return str.replace(/[a-z]/gi, char => {
        const isUpperCase = char <= 'Z';
        const start = isUpperCase ? 65 : 97;
        const x = char.charCodeAt(0) - start;

        if (/[a-z]/i.test(char)) {
            const k = keyword.charCodeAt(keywordIndex % keyword.length) - 97;
            const result = encode
                ? (x + k) % m
                : (x - k + m) % m;
            keywordIndex++;
            return String.fromCharCode(start + result);
        }
        return char;
    });
}

function hillCipher(str, matrixString, encode = true) {
    const mod = 26;
    const matrix = matrixString.split(',').map(Number);
    const matrixSize = Math.sqrt(matrix.length);

    if (!Number.isInteger(matrixSize) || matrixSize !== 2) {
        throw new Error('Ma trận phải là ma trận 2x2');
    }

    const determinant = (matrix) => {
        return (matrix[0] * matrix[3] - matrix[1] * matrix[2]) % mod;
    };

    const modInverse = (a, m) => {
        for (let x = 1; x < m; x++) {
            if ((a * x) % m === 1) return x;
        }
        throw new Error('Ma trận không có nghịch đảo');
    };

    const invertMatrix = (matrix) => {
        const det = determinant(matrix);
        const invDet = modInverse((det + mod) % mod, mod);
        return [
            (matrix[3] * invDet) % mod,
            (-matrix[1] * invDet + mod) % mod,
            (-matrix[2] * invDet + mod) % mod,
            (matrix[0] * invDet) % mod
        ];
    };

    const multiplyMatrix = (vector, matrix) => {
        return [
            (vector[0] * matrix[0] + vector[1] * matrix[1]) % mod,
            (vector[0] * matrix[2] + vector[1] * matrix[3]) % mod
        ];
    };

    const textToVector = (text) => {
        return text.split('').map(char => char.charCodeAt(0) - 97);
    };

    const vectorToText = (vector) => {
        return vector.map(num => String.fromCharCode(num + 97)).join('');
    };

    const vectors = [];
    for (let i = 0; i < str.length; i += matrixSize) {
        const vector = textToVector(str.slice(i, i + matrixSize));
        if (vector.length === matrixSize) vectors.push(vector);
    }

    const keyMatrix = encode ? matrix : invertMatrix(matrix);
    return vectors.map(vector => vectorToText(multiplyMatrix(vector, keyMatrix))).join('');
}

function desCipher(str, key, encode = true) {
    if (encode) {
        return CryptoJS.DES.encrypt(str, key).toString();
    } else {
        return CryptoJS.DES.decrypt(str, key).toString(CryptoJS.enc.Utf8);
    }
}

function aesCipher(str, key, encode = true) {
    if (encode) {
        return CryptoJS.AES.encrypt(str, key).toString();
    } else {
        return CryptoJS.AES.decrypt(str, key).toString(CryptoJS.enc.Utf8);
    }
}

function rsaCipher(input, p, q, e, encode = true) {
    const n = p * q;
    const phi = (p - 1) * (q - 1);

    const gcd = (a, b) => {
        while (b !== 0) {
            [a, b] = [b, a % b];
        }
        return a;
    };

    const modInverse = (a, m) => {
        for (let x = 1; x < m; x++) {
            if ((a * x) % m === 1) return x;
        }
        throw new Error('Không tìm được nghịch đảo modulo.');
    };

    if (gcd(e, phi) !== 1) {
        throw new Error('e phải là nguyên tố cùng nhau với ϕ(n).');
    }

    const d = modInverse(e, phi);

    if (encode) {
        const asciiValues = input.split('').map(char => char.charCodeAt(0));
        const ciphertext = asciiValues.map(m => BigInt(m) ** BigInt(e) % BigInt(n));
        return ciphertext.join(' ');
    } else {
        const cipherValues = input.split(' ').map(BigInt); // tách chuỗi và chuyển thành BigInt
        const originalMessage = cipherValues.map(c => String.fromCharCode(Number(c ** BigInt(d) % BigInt(n))));
        return originalMessage.join(''); 
    }
}

function importTextFile(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = function(e) {
        document.getElementById('plaintext').value = e.target.result;
    };
    reader.readAsText(file);
}

function exportTextFile(content) {
    const blob = new Blob([content], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'result.txt';
    link.click();
}

document.getElementById('cipher-type').addEventListener('change', function () {
    const caesarParams = document.getElementById('caesar-params');
    const affineParams = document.getElementById('affine-params');
    const vigenereParams = document.getElementById('vigenere-params');
    const hillParams = document.getElementById('hill-params');
    const desParams = document.getElementById('des-params');
    const aesParams = document.getElementById('aes-params');
    const rsaParams = document.getElementById('rsa-params');

    caesarParams.style.display = 'none';
    affineParams.style.display = 'none';
    vigenereParams.style.display = 'none';
    hillParams.style.display = 'none';
    desParams.style.display = 'none';
    aesParams.style.display = 'none';
    rsaParams.style.display = 'none';

    if (this.value === 'caesar') caesarParams.style.display = 'flex';
    else if (this.value === 'affine') affineParams.style.display = 'flex';
    else if (this.value === 'vigenere') vigenereParams.style.display = 'flex';
    else if (this.value === 'hill') hillParams.style.display = 'flex';
    else if (this.value === 'des') desParams.style.display = 'flex';
    else if (this.value === 'aes') aesParams.style.display = 'flex';
    else if (this.value === 'rsa') rsaParams.style.display = 'flex';
});

function processText() {
    const cipherType = document.getElementById('cipher-type').value;
    const plaintext = document.getElementById('plaintext').value;

    let result = '';

    try {
        if (cipherType === 'caesar') {
            const shift = parseInt(document.getElementById('shift').value);
            const mode = document.getElementById('mode').value;
            result = caesarCipher(plaintext, shift, mode === 'encode');
        } else if (cipherType === 'affine') {
            const a = parseInt(document.getElementById('a').value);
            const b = parseInt(document.getElementById('b').value);
            const mode = document.getElementById('affine-mode').value;
            result = affineCipher(plaintext, a, b, mode === 'encode');
        } else if (cipherType === 'vigenere') {
            const keyword = document.getElementById('keyword').value;
            const mode = document.getElementById('vigenere-mode').value;
            result = vigenereCipher(plaintext, keyword, mode === 'encode');
        } else if (cipherType === 'hill') {
            const matrix = document.getElementById('matrix').value;
            const mode = document.getElementById('hill-mode').value;
            result = hillCipher(plaintext, matrix, mode === 'encode');
        } else if (cipherType === 'des') {
            const key = document.getElementById('des-key').value;
            const mode = document.getElementById('des-mode').value;
            result = desCipher(plaintext, key, mode === 'encode');
        } else if (cipherType === 'aes') {
            const key = document.getElementById('aes-key').value;
            const mode = document.getElementById('aes-mode').value;
            result = aesCipher(plaintext, key, mode === 'encode');
        } else if (cipherType === 'rsa') {
            const p = parseInt(document.getElementById('p').value);
            const q = parseInt(document.getElementById('q').value);
            const e = parseInt(document.getElementById('e').value);
            const mode = document.getElementById('rsa-mode').value;
            result = rsaCipher(plaintext, p, q, e, mode === 'encode');
        }

        document.getElementById('ciphertext').value = result;
    } catch (error) {
        document.getElementById('ciphertext').value = error.message;
    }
}

document.getElementById('file-input').addEventListener('change', importTextFile);

document.getElementById('export-button').addEventListener('click', function() {
    const result = document.getElementById('ciphertext').value;
    exportTextFile(result);
});