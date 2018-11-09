class FireEffectDisplayObject extends egret.DisplayObjectContainer{

	private _yellowBitmap:egret.Bitmap
	private _originBitmap:egret.Bitmap
	private _blackBitmap:egret.Bitmap

	private origin_scale:number = 1
	private target_scale:number = 1 * 1.2

	public wait_black:boolean = true
	private wait_black_total_time:number = 0
	private wait_black_cur_time:number = 0

	public wait_play_total_time:number = 5
	private wait_play_curr_time:number = 0

	public constructor() {
		super()

		let new_bitmap = new egret.Bitmap()
		new_bitmap.texture = RES.getRes("qiu12_png")
		new_bitmap.anchorOffsetX = new_bitmap.width / 2
		new_bitmap.anchorOffsetY = new_bitmap.height / 2
		this._yellowBitmap = new_bitmap
		this.addChild(new_bitmap)

		new_bitmap = new egret.Bitmap()
		new_bitmap.texture = RES.getRes("qiu13_png")
		new_bitmap.anchorOffsetX = new_bitmap.width / 2
		new_bitmap.anchorOffsetY = new_bitmap.height / 2
		this._originBitmap = new_bitmap
		this.addChild(new_bitmap)

		new_bitmap = new egret.Bitmap()
		new_bitmap.texture = RES.getRes("qiu1_png")
		new_bitmap.anchorOffsetX = new_bitmap.width / 2
		new_bitmap.anchorOffsetY = new_bitmap.height / 2
		this._blackBitmap = new_bitmap
		this.addChild(new_bitmap)
		
		this.visible = false
	}

	public ReCreate():void
	{
		this._yellowBitmap.alpha = 0.8
		this._yellowBitmap.scaleX = this._yellowBitmap.scaleY = this.origin_scale
		this._yellowBitmap.visible = true

		this._originBitmap.alpha = 0
		this._originBitmap.scaleX = this._originBitmap.scaleY = this.origin_scale
		this._originBitmap.visible = true

		this._blackBitmap.alpha = 0
		this._blackBitmap.scaleX = this._blackBitmap.scaleY = this.origin_scale
		this._blackBitmap.visible = false

		this.wait_black = Math.ceil(Math.random() * 15) == 1
		this.wait_black_total_time = Math.floor(Math.random() * 5) + 15
		this.wait_black_cur_time = 0

		this.wait_play_curr_time = 0
		this.visible = true
	}

	private _random_black_alpha = 0
	public Update():boolean
	{
		this.wait_play_curr_time += 1
		if(this.wait_play_curr_time < this.wait_play_total_time){
			return true
		}
		this._yellowBitmap.alpha -= 0.08
		this._yellowBitmap.scaleX += 0.008
		this._yellowBitmap.scaleX = Math.min(this._yellowBitmap.scaleX, this.target_scale)
		this._yellowBitmap.scaleY = this._yellowBitmap.scaleX

		if(this._yellowBitmap.alpha <= 0)
		{
			this._yellowBitmap.visible = false
			this._originBitmap.alpha -= 0.1
			this._blackBitmap.alpha += 0.05
			this._blackBitmap.alpha = Math.min(this._blackBitmap.alpha, 1)
			this._blackBitmap.visible = true
			if(this._originBitmap.alpha <= 0){
				if(this.wait_black){
					this._originBitmap.visible = false
					this.wait_black_cur_time += 1
					if(this.wait_black_cur_time >= this.wait_black_total_time){
						this.visible = false;
						return false
					}
				}else{
					this.visible = false;
					return false;
				}
			}
		} else {
			this._originBitmap.alpha += 0.08
			this._originBitmap.scaleX += 0.008
			this._originBitmap.scaleX = Math.min(this._originBitmap.scaleX, this.target_scale)
			this._originBitmap.scaleY = this._originBitmap.scaleX

			this._blackBitmap.scaleX = this._blackBitmap.scaleY = this._originBitmap.scaleX
		}
		return true
	}
}

class FireEffect extends egret.DisplayObjectContainer{
	private _playerBall:PlayerBall
	private _cacheFires:Array<FireEffectDisplayObject> = []
	private _usingFires:Array<FireEffectDisplayObject> = []
	private _last_point:egret.Point = new egret.Point()

	public constructor(playerBall:PlayerBall) {
		super()
		super()
		this._playerBall = playerBall
		this._createFires()
	}

	private _createFires():void
	{
		for(let index = 0; index < 100; index ++)
		{
			let new_fire = new FireEffectDisplayObject()
			this.addChild(new_fire)
			this._cacheFires.push(new_fire)
		}
		this._playerBall.m_basket_ball.parent.addChild(this)
		this._playerBall.m_basket_ball.parent.setChildIndex(this, 1)
	}
	
	public Update(need_create:boolean):void
	{
		for(let index = this._usingFires.length - 1; index >= 0; index --)
		{
			let fireDisplayObject = this._usingFires[index]
			if(!fireDisplayObject.Update())
			{
				this._usingFires.splice(index, 1)
				this._cacheFires.push(fireDisplayObject)
			}
		}

		if(!need_create)
		{
			return
		}

		if(this._cacheFires.length <= 0)
		{
			return
		}

		let distance = Math.sqrt(Math.pow(this._playerBall.m_basket_ball.x - this._last_point.x, 2) + Math.pow(this._playerBall.m_basket_ball.y - this._last_point.y, 2));
		let compare_distance = (this._playerBall.m_basket_ball.height * 0.4)
		if(distance > compare_distance)
		{
			let speed_vertical_vec = new egret.Point(this._playerBall.basketball_speed_y * -1, this._playerBall.basketball_speed_x)
			speed_vertical_vec.normalize(1)
			let speed_vec = new egret.Point(this._playerBall.basketball_speed_x, this._playerBall.basketball_speed_y)
			speed_vec.normalize(1)
			let random_count = Math.ceil(Math.random() * 2) + 2
			for(let index = 0; index < random_count; index ++)
			{
				let new_fire = this._cacheFires.shift()
				new_fire.ReCreate()
				let range = this._playerBall.m_basket_ball.width / 10
				let vectical_random_range = BasketUtils.GetRandomScope(-range, range)
				let vectical_move_x = vectical_random_range * speed_vertical_vec.x
				let vectical_move_y = vectical_random_range * speed_vertical_vec.y

				let speed_random_range = BasketUtils.GetRandomScope(-this._playerBall.m_basket_ball.width, 0)
				let speed_move_back_x = speed_random_range * speed_vec.x
				let speed_move_back_y = speed_random_range * speed_vec.y
				new_fire.x = this._playerBall.m_basket_ball.x + vectical_move_x + this._playerBall.m_basket_ball.width / 2 + speed_move_back_x
				new_fire.y = this._playerBall.m_basket_ball.y + vectical_move_y + this._playerBall.m_basket_ball.height / 2 + speed_move_back_y
				this._usingFires.push(new_fire)
				this._last_point.x = this._playerBall.m_basket_ball.x
				this._last_point.y = this._playerBall.m_basket_ball.y
				
				if(index == 0){
					new_fire.wait_play_total_time = 0
				}
				if(this._cacheFires.length <= 0)
				{
					return
				}
			}
		}
	}
}