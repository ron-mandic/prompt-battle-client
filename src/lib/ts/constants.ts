const TEXT_P = "<p class='font-thin'><span class='font-bold'>Prompt</span>Battle</p>";
const TEXT_H1 = "<h1 class='font-thin'><span class='font-bold'>Prompt</span>Battle</h1>";

const P5_WIDTH = 512;
const P5_HEIGHT = 512;
const P5_FRAME_RATE = 60;

const BATCH_SIZE = 3;
const NEGATIVE_PROMPT =
	'naked, sex, porn, erotic, adult, XXX, nudity, obscene, r-rated, hardcore, nsfw, lowres, text, error, cropped, worst quality, low quality, jpeg artifacts, ugly, duplicate, morbid, mutilated, out of frame, extra fingers, mutated hands, poorly drawn hands, poorly drawn face, mutation, deformed, blurry, dehydrated, bad anatomy, bad proportions, extra limbs, cloned face, disfigured, gross proportions, malformed limbs, missing arms, missing legs, extra arms, extra legs, fused fingers, too many fingers, long neck, username, watermark, signature';
const URL_SERVER = 'http://localhost:3000'; // 'http://192.168.178.30:3000'

const CANVAS_SOCKET_EACH_SECONDS = 60;
const TIMER_PROMPT_SECONDS = 5;
const TIMER_SCRIBBLE_SECONDS = 30;
const UNKNOWN = '?';

export {
	TEXT_P,
	TEXT_H1,
	P5_WIDTH,
	P5_HEIGHT,
	P5_FRAME_RATE,
	BATCH_SIZE,
	NEGATIVE_PROMPT,
	URL_SERVER,
	CANVAS_SOCKET_EACH_SECONDS,
	TIMER_PROMPT_SECONDS,
	TIMER_SCRIBBLE_SECONDS,
	UNKNOWN
};
