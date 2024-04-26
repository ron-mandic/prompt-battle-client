// TODO: Resolve type errors

export class Simple1111Api {
	constructor(p5, _url) {
		this.auto1111Url = _url;
		this.isProcessing = false;
		this.model_list;
		this.modelNumber = 0;
		this.res = 512;
		this.p5 = p5;

		this.img = p5.createImage(this.res, this.res);
		this.cimg = p5.createImage(this.res, this.res);
		this.txt = 'No Clip generated yet ...';
		this.isReady = false;
	}

	async txtToImg(_prompt, _controlnetImg, _controlnetModel) {
		let prompt;
		if (_prompt) {
			prompt = _prompt;
		}

		let controlnetImg;
		if (_controlnetImg) {
			controlnetImg = _controlnetImg;
		}

		let controlnetModel = this.model_list[this.modelNumber];
		if (_controlnetModel) {
			controlnetModel = _controlnetModel;
		}

		let payload;
		let url = this.auto1111Url + 'sdapi/v1/txt2img/';

		if (_prompt) {
			this.isProcessing = true;
			payload = {
				prompt: prompt,
				steps: 20,
				cfg_scale: 6,
				width: this.res,
				height: this.res,

				alwayson_scripts: {}
			};

			if (controlnetImg && controlnetModel) {
				payload.alwayson_scripts = {
					controlnet: {
						args: [
							{
								input_image: controlnetImg.canvas.toDataURL(),
								module: 'none',
								model: controlnetModel
							}
						]
					}
				};
			} else {
				console.log('Proceeding without Controlnet Image and a Controlnet Model ...');
			}

			let genImage = await this.p5.httpPost(url, 'json', payload);
			this.img = this.p5.loadImage('data:image/png;base64,' + genImage.images[0]);
			this.isProcessing = false;
		} else {
			console.log('Need at least a promt ...');
		}
	}

	async imgToTxt(_img) {
		let img;
		if (_img) {
			img = _img;
		}
		let url = this.auto1111Url + 'sdapi/v1/interrogate';
		let payload;
		let clipStr;

		if (img) {
			this.isProcessing = true;

			payload = {
				image: img.canvas.toDataURL(),
				model: 'clip'
			};
			let t = await this.p5.httpPost(url, 'json', payload);
			this.txt = t.caption;
			console.log(this.txt);
			this.isProcessing = false;
		} else {
			console.log('Need an Image ...');
		}
	}

	async imgToControlnet(_img, _controlnetModule) {
		let payload;

		let img;
		if (_img) {
			img = _img;
		}

		let controlnetModule = _controlnetModule;
		for (const model in this.model_list) {
			console.log(this.model_list[model]);
			if (this.model_list[model].search(controlnetModule) != -1) {
				this.modelNumber = model;
				console.log(this.modelNumber);
				break;
			}
		}

		let controlnetModel = this.model_list[this.modelNumber];

		//let tmpImg = img.canvas.toDataURL().toString();
		if (img) {
			this.isProcessing = true;

			payload = {
				controlnet_module: controlnetModule,
				model: controlnetModel,
				controlnet_input_images: [img.canvas.toDataURL().toString()]
			};
			console.log(payload);
			let i = await this.p5.httpPost(
				this.auto1111Url + 'controlnet/detect',
				'application/json',
				payload
			);
			this.cimg = this.p5.loadImage('data:image/png;base64,' + JSON.parse(i).images[0]);
			this.isProcessing = false;
		} else {
			console.log('Need an Image, Controlnet Type and Controlnet Model');
		}
	}

	async getControlnetInfo() {
		let url = this.auto1111Url + 'controlnet/model_list';
		let list;
		let test = false;
		list = await this.p5.httpGet(
			url,
			'json',
			false,
			function (response) {
				test = true;
			},
			function (error) {
				test = false;
				alert('not valid url ...');
			}
		);
		console.log(test);
		this.isReady = test;
		if (this.isReady == true) {
			this.model_list = list.model_list;
			console.log(this.model_list);
		}
	}
}
