// TODO: Resolve type errors

import { BATCH_SIZE } from '$lib/ts/constants';
import type p5 from 'p5';

export class Automatic1111 {
	auto1111Url: string;
	isProcessing: boolean;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	model_list: Array<any>;
	modelNumber: number | string;
	res: number;
	p5: p5;

	img: p5.Image;
	cimg: p5.Image;
	txt: string;
	isReady: boolean;

	constructor(p5: p5, _url: string) {
		this.auto1111Url = _url;
		this.isProcessing = false;
		this.model_list = [];
		this.modelNumber = 0;
		this.res = 512;
		this.p5 = p5;

		this.img = p5.createImage(this.res, this.res);
		this.cimg = p5.createImage(this.res, this.res);
		this.txt = 'No Clip generated yet ...';
		this.isReady = false;
	}

	async txtToImg(
		_prompt: string,
		_controlnetImg: p5.Graphics | null,
		_controlnetModel: string | undefined,
		batch_size = BATCH_SIZE
	) {
		let prompt: string | undefined;
		if (_prompt) {
			prompt = _prompt;
		}

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		let controlnetImg: any;
		if (_controlnetImg) {
			controlnetImg = _controlnetImg;
		}

		// @ts-expect-error - any does not exist
		let controlnetModel = this.model_list[this.modelNumber];
		if (_controlnetModel) {
			controlnetModel = _controlnetModel;
		}

		let payload;
		const url = this.auto1111Url + 'sdapi/v1/txt2img/';

		if (_prompt) {
			this.isProcessing = true;
			payload = {
				prompt: prompt,
				steps: 20,
				cfg_scale: 6,
				width: this.res,
				height: this.res,
				batch_size: batch_size + 1,
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

			const genImage = await this.p5.httpPost(url, 'json', payload);
			this.isProcessing = false;

			return genImage.images;
		} else {
			console.warn('Need at least a prompt, Bro ...');
		}
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	async imgToTxt(_img: any) {
		let img;
		if (_img) {
			img = _img;
		}
		const url = this.auto1111Url + 'sdapi/v1/interrogate';
		let payload;

		if (img) {
			this.isProcessing = true;

			payload = {
				image: img.canvas.toDataURL(),
				model: 'clip'
			};
			const t = await this.p5.httpPost(url, 'json', payload);
			this.txt = t.caption;
			console.log(this.txt);
			this.isProcessing = false;
		} else {
			console.log('Need an Image ...');
		}
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	async imgToControlnet(_img: any, _controlnetModule: any) {
		let payload;

		let img;
		if (_img) {
			img = _img;
		}

		const controlnetModule = _controlnetModule;
		for (const model in this.model_list) {
			console.log(this.model_list[model]);
			if (this.model_list[model].search(controlnetModule) != -1) {
				this.modelNumber = model;
				console.log(this.modelNumber);
				break;
			}
		}

		// @ts-expect-error - any does not exist
		const controlnetModel = this.model_list[this.modelNumber];

		//let tmpImg = img.canvas.toDataURL().toString();
		if (img) {
			this.isProcessing = true;

			payload = {
				controlnet_module: controlnetModule,
				model: controlnetModel,
				controlnet_input_images: [img.canvas.toDataURL().toString()]
			};
			console.log(payload);
			const i = await this.p5.httpPost(
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
		const url = this.auto1111Url + 'controlnet/model_list';
		let test = false;

		const list = await this.p5.httpGet(
			url,
			'json',
			false,
			function (/* response */) {
				test = true;
			},
			function (/* error */) {
				test = false;
				alert('not valid url ...');
			}
		);
		console.log(test);
		this.isReady = test;
		// @ts-expect-error - TS complains unnecessary comparison
		if (this.isReady == true) {
			this.model_list = list.model_list;
			console.log(this.model_list);
		}
	}
}
