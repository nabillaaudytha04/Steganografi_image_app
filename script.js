function generateKey(plainText, key) {
	key = key.split('')

	if (plainText.length == key.length) {
		return key.join('')
	} else {
		let temp = key.length

		for (let i = 0; i < plainText.length - temp; i++) {
			key.push(key[i % key.length])
		}
	}

	return key.join('').toUpperCase()
}

function encryptText(plainText, key) {
	let cipherText = ''

	for (let i = 0; i < plainText.length; i++) {
		if (plainText[i] == ' ') {
			cipherText += plainText[i]
		} else {
			let charCode = plainText[i].charCodeAt(0)

			if (charCode >= 65 && charCode <= 90) {
				let x =
					((charCode + key[i].charCodeAt(0) + 26) % 26) + 'A'.charCodeAt(0)

				cipherText += String.fromCharCode(x)
			} else if (charCode >= 97 && charCode <= 122) {
				let x =
					((charCode + key[i].charCodeAt(0) + 52) % 26) + 'a'.charCodeAt(0)

				cipherText += String.fromCharCode(x)
			}
		}
	}

	return cipherText
}

function decryptText(cipherText, key) {
	let decryptedText = ''

	for (let i = 0; i < cipherText.length; i++) {
		if (cipherText[i] == ' ') {
			decryptedText += cipherText[i]
		} else {
			let charCode = cipherText[i].charCodeAt(0)

			if (charCode >= 65 && charCode <= 90) {
				let x =
					((charCode - key[i].charCodeAt(0) + 26) % 26) + 'A'.charCodeAt(0)

				decryptedText += String.fromCharCode(x)
			} else if (charCode >= 97 && charCode <= 122) {
				let x =
					((charCode - key[i].charCodeAt(0) + 14) % 26) + 'a'.charCodeAt(0)

				decryptedText += String.fromCharCode(x)
			}
		}
	}

	return decryptedText
}

function download() {
	const imagePreview = document.getElementById('image-preview')
	const a = document.createElement('a')
	a.href = imagePreview.src
	a.download = `${new Date().getTime()}-stego-image.png`

	document.body.appendChild(a)
	a.click()
	document.body.removeChild(a)
}

function hideMessageToImage(e) {
	e.preventDefault()

	const uploadedImg = document.getElementById('image-upload')
	const imagePreview = document.getElementById('image-preview')
	const pesan = document.getElementById('pesan')

	const keyValue = document.getElementById('key').value

	if (!uploadedImg) {
		alert(
			'Gambar belum terbaca oleh sistem, silahkan unggah gambar terlebih dahulu.'
		)
		return
	}

	if (!pesan.value) {
		alert('Pesan kosong, silahkan masukkan pesan terlebih dahulu.')
		return
	}

	const pesanPattern = /^[A-Za-z\t\n ]+$/
	if (!pesanPattern.test(pesan.value)) {
		alert(
			'Pesan harus alphabet yaitu huruf (a-z) dalam kapital ataupun huruf kecil.'
		)
		return
	}

	if (!keyValue) {
		alert('kunci kosong, silahkan isi masing - masing kunci terlebih dahulu.')
		return
	}

	const canvas = document.createElement('canvas')
	const context = canvas.getContext('2d')

	const img = new Image()
	img.onload = function () {
		canvas.width = img.width
		canvas.height = img.height

		context.drawImage(img, 0, 0)
		const imgData = context.getImageData(0, 0, canvas.width, canvas.height)
		const data = imgData.data
		let msg = pesan.value

		const key = generateKey(msg, keyValue)
		const cipherText = encryptText(msg, key)

		let binaryText = new String()
		for (let i = 0; i < cipherText.length; i++) {
			binaryText += cipherText[i].codePointAt(0).toString(2).padStart(8, '0')
		}

		let index = 0
		for (let i = 0; i < data.length; i += 4) {
			for (let j = 0; j < 3; j++) {
				data[i + j] = (data[i + j] & ~1) | parseInt(binaryText[index])
				index++
			}
		}

		context.putImageData(imgData, 0, 0)
		imagePreview.src = canvas.toDataURL()
	}

	img.src = URL.createObjectURL(uploadedImg.files[0])
}

function extractMessageFromImage(e) {
	e.preventDefault()

	const uploadedImg = document.getElementById('image-upload')
	const messageExtracted = document.getElementById('pesan')
	const imagePreview = document.getElementById('image-preview')

	const canvas = document.createElement('canvas')
	const context = canvas.getContext('2d')

	const keyValue = document.getElementById('key').value

	if (!uploadedImg) {
		alert(
			'Gambar belum terbaca oleh sistem, silahkan unggah gambar terlebih dahulu.'
		)
		return
	}

	if (!keyValue) {
		alert('kunci kosong, silahkan isi masing - masing kunci terlebih dahulu.')
		return
	}

	const img = new Image()
	img.onload = function () {
		canvas.width = img.width
		canvas.height = img.height

		context.drawImage(img, 0, 0)
		const imgData = context.getImageData(0, 0, img.width, img.height)
		const data = imgData.data

		let binaryText = new String()
		for (let i = 0; i < data.length; i += 4) {
			for (let j = 0; j < 3; j++) {
				binaryText += (data[i + j] & 1).toString()
			}
		}

		let cipherText = new String()
		for (let i = 0; i < binaryText.length; i += 8) {
			var byte = binaryText.slice(i, i + 8)
			if (!parseInt(byte, 2)) {
				break
			}
			cipherText += String.fromCharCode(parseInt(byte, 2))
		}

		const key = generateKey(cipherText, keyValue)
		const msg = decryptText(cipherText, key)

		context.putImageData(imgData, 0, 0)
		imagePreview.src = canvas.toDataURL()
		messageExtracted.value = msg
	}

	img.src = URL.createObjectURL(uploadedImg.files[0])
}

function resetHandler() {
	window.location.reload()
}

const formEncode = document.getElementById('form-encode') || null
const formDecode = document.getElementById('form-decode') || null

if (formEncode != null) {
	formEncode.addEventListener('submit', hideMessageToImage, false)
}

if (formDecode != null) {
	formDecode.addEventListener('submit', extractMessageFromImage, false)
}
