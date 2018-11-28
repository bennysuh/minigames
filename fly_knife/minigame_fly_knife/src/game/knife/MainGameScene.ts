module ui{
	export class MainGameScene extends ui.Window{

		private m_touch_layer:eui.Group
		private m_knife_object:KnifeObject
		public m_container_layer:eui.Group
		public m_plate_container:eui.Group
		private m_example_knife:eui.Image
		public m_plate_image:eui.Image
		public m_plate_object:PlateObject
		private labelResult:eui.Label
		private label_round:eui.Label
		private m_top_ui:eui.Group
		public m_copy_plat_container:eui.Group

		private label_other_name:eui.Label
		private label_me_name:eui.Label
		private label_other_round:eui.Label
		private label_me_round:eui.Label
		private img_other_icon:eui.Image
		private img_me_icon:eui.Image
		private label_left_time:eui.Label

		private m_offline_tips:eui.Group
	
		private btn_prop_knife:eui.Button
		private btn_debug:eui.Button

		private _all_knife_imgs:Array<eui.Image> = []
		private fly_up:egret.tween.TweenGroup

		public current_round:number = 0
		public all_round_configs:Array<RoundConfig> = []
		private _waiting_join:boolean = true

		public serverModel:ServerModel = new ServerModel()
		private _is_game_over:boolean = false
		private _timer:egret.Timer

		public constructor() {
			super()
			this.skinName = "MainSceneSkin"
			this.addEventListener(egret.Event.ADDED_TO_STAGE, this._onAddToStage, this)

			let round_native_configs:Array<Object>  = RES.getRes("rounds_json")
			for(let index = 0; index < round_native_configs.length; index ++)
			{
				let native_config = round_native_configs[index]
				let round_config = new RoundConfig(native_config)
				this.all_round_configs.push(round_config)
			}
			for(let index = round_native_configs.length - 1; index >= 0; index--)
			{
				this.all_round_configs.push(this.all_round_configs[round_native_configs.length - index - 1])
			}
		}

		public resizeStage():void
		{
			super.resizeStage()
			let design_height = Const.MIN_HEIGHT
			let target_y = (design_height - this.height) / 2
			target_y = 0
			this.m_top_ui.y = target_y
		}

		private _onAddToStage(event:egret.Event):void
		{
		}

		protected createChildren(): void {
			super.createChildren();

			for(let index = 1; index <= 10; index++)
			{
				let img = this['img_knife_' + index]
				this._all_knife_imgs.push(img)
			}

			let __this = this
			this.btn_prop_knife.addEventListener(egret.TouchEvent.TOUCH_BEGIN, function(event:egret.Event){
				__this.m_plate_object.WaitToInsertNewKnife()
				event.stopPropagation()
			}.bind(this), this)

			this.btn_debug.addEventListener(egret.TouchEvent.TOUCH_BEGIN, function(event:egret.Event){
				ui.WindowManager.getInstance().open("SettingPanel")
				event.stopPropagation()
			}.bind(this), this)

			this.m_plate_container.visible = false
			this.m_top_ui.visible = false

			this._addAnimation()
		}

		private m_place_feng:eui.Group
		private _wind_armatureDisplay:dragonBones.EgretArmatureDisplay
		private _knife_shadow_armatureDisplay:dragonBones.EgretArmatureDisplay
		private _explosion_armatureDisplay:dragonBones.EgretArmatureDisplay

		private _addAnimation():void
		{
			let armatureDisplay = KnifeUtils.createDragonBones("wind_ske_json", "wind_tex_json", "wind_tex_png", "wind_armature")
			this.m_plate_container.parent.addChild(armatureDisplay)
			armatureDisplay.scaleX = armatureDisplay.scaleY = 1.5
			armatureDisplay.x = this.m_place_feng.x
			armatureDisplay.y = this.m_place_feng.y
			armatureDisplay.visible = false
			this._wind_armatureDisplay = armatureDisplay

			let armatureDisplay2 = KnifeUtils.createDragonBones("knife_shadow_ske_json", "knife_shadow_tex_json", "knife_shadow_tex_png", "knife_shadow_armature")
			this.m_plate_container.parent.addChild(armatureDisplay2)
			armatureDisplay2.x = this.m_place_feng.x
			armatureDisplay2.y = this.m_place_feng.y + 100
			armatureDisplay2.visible = false
			this._knife_shadow_armatureDisplay = armatureDisplay2
			armatureDisplay2.addDBEventListener(dragonBones.AnimationEvent.COMPLETE, function(){
				// armatureDisplay2.visible = false
			}, this)

			let armatureDisplay3 = KnifeUtils.createDragonBones("explosion_ske_json", "explosion_tex_json", "explosion_tex_png", "explosion_armature")
			this.m_plate_container.parent.addChild(armatureDisplay3)
			armatureDisplay3.visible = false
			this._explosion_armatureDisplay = armatureDisplay3
		}

		public StartGame():void
		{
			this.m_plate_container.visible = true
			this.m_top_ui.visible = true
			this.m_offline_tips.visible = false

			this.serverModel.myRole.level = 1
			this.removeEventListener(egret.Event.ENTER_FRAME, this._onEnterFrame, this)
			this.addEventListener(egret.Event.ENTER_FRAME, this._onEnterFrame, this)

			this.m_plate_object = new PlateObject(this)
			this.m_touch_layer.addEventListener(egret.TouchEvent.TOUCH_BEGIN, this._onTouchBegin, this)

			this._update_player_info()
			this._update_player_round()
			this.validateNow()

			this.NextRound()
			
			this._startTimer()
		}

		public ReStartGame():void
		{
			if(this.m_knife_object){
				this.m_knife_object.Destory()
				this.m_knife_object = null
			}
			if(this._other_knife_object){
				this._other_knife_object.Destory()
				this._other_knife_object = null
			}
			this.NextRound()
		}

		public NextRound():void
		{
			this.label_round.text = "第" + (this.current_round + 1) + "关"
			this.labelResult.visible = false
			let round_config = this.all_round_configs[this.current_round]
			round_config.Reset()
			this.m_plate_object.EnterNextBigRound(round_config)
			this.GenerateNextKnife()
			for(let index = 0; index < this._all_knife_imgs.length; index++)
			{
				let img = this._all_knife_imgs[index]
				img.source = 'knifeicon11_png'
				img.visible = false
			}

			for(let index = 0; index < this.m_plate_object.GetMaxKnifeCount(); index++)
			{
				let img = this._all_knife_imgs[index]
				img.visible = true
			}
		}

		public OnGetScore():void
		{
			let knife_count = this.m_plate_object.GetAllMyKnifeCount()
			let img = this._all_knife_imgs[knife_count - 1]
			img.source = 'knifeicon12_png'
		}

		private _onEnterFrame(event:egret.Event):void
		{
			if(this.m_knife_object){
				let __this = this
				let left_time_scale = this.m_knife_object.UpdateVersion2(function(time_scale){
					__this.m_plate_object.UpdateVersion2(time_scale)
				})
				__this.m_plate_object.UpdateVersion2(left_time_scale)
			} else {
				this.m_plate_object.UpdateVersion2(1)
			}

			if(this.m_plate_object.has_other_knife && this.m_plate_object.CheckCanInsertOtherKnife()){
				this.m_plate_object.has_other_knife = false
				this.GenerateOtherKnife()
			}
			
			if(this._other_knife_object){
				this._other_knife_object.Update()

				if(this._other_knife_object.is_end){
					this._other_knife_object = null
				}
			}
		}

		private _onTouchBegin(event:egret.TouchEvent):void
		{
			if(this.m_knife_object){
				if(this.m_knife_object.is_end){
					return
				}
				this.m_knife_object.StartTouchMove()
			}
		}

		public GenerateNextKnife():void
		{
			this.m_knife_object = new KnifeObject(this)
			this.m_container_layer.addChild(this.m_knife_object)
			this.m_knife_object.StartBirthMove(this.m_example_knife.x, this.m_example_knife.y)
		}

		private _other_knife_object:KnifeObject
		public GenerateOtherKnife():void
		{
			if(this._other_knife_object)
			{
				return
			}
			let new_other_knife = new KnifeObject(this)
			new_other_knife.isMe = false
			new_other_knife.x = this.m_plate_container.x + this.m_plate_container.width / 2 + 100
			new_other_knife.y = this.m_plate_container.y - this.m_plate_container.height / 2  - 100
			new_other_knife.rotation = 225
			new_other_knife.speedY = 100
			new_other_knife.speedX = -100
			new_other_knife.acceY = 0
			this.m_container_layer.addChild(new_other_knife)
			this._other_knife_object = new_other_knife
		}

		private _is_last_round_win:boolean = false
		public ShowResult(isWin:boolean):void
		{
			this._is_last_round_win = isWin
			// if(isWin){
			// 	this.labelResult.text = "恭喜您 闯关成功"
			// } else {
			// 	this.labelResult.text = "很遗憾 闯关失败"
			// }
			// 
			// this.labelResult.visible = true
			// this.fly_up.play(1)
			// this.fly_up.removeEventListener('complete', this._onPlayFlyUpCompelete, this);
			// this.fly_up.addEventListener('complete', this._onPlayFlyUpCompelete, this);

			let __this = this
			if(isWin){
				this.m_plate_object.ShowWinAnimation(function(){
					__this._onPlayFlyUpCompelete()
				})

				// KnifeUtils.performDelay(function(){
				// 	__this._onPlayFlyUpCompelete()
				// }, 0.2 * 1000, this)

			} else {
				KnifeUtils.performDelay(function(){
					__this._onPlayFlyUpCompelete()
				}, 0.1 * 1000, this)
			}
		}

		private _onPlayFlyUpCompelete():void
		{
			if(this._is_last_round_win){
				this.current_round = (this.current_round + 1) % this.all_round_configs.length
				this.serverModel.myRole.level += 1
				this.m_plate_object.RandomChangeBallBg()
				this._update_player_round()
				GameNet.reqSwitch(this.current_round + 1)
			}
			this.NextRound()
		}

		private _startTimer():void
		{
			var timer:egret.Timer = new egret.Timer(1000, Const.GAME_TIME);
			//注册事件侦听器
			timer.addEventListener(egret.TimerEvent.TIMER,this._on_timer_tick,this);
			//开始计时
			timer.start();
			this._timer = timer

			this._update_left_time()
		}

		private _on_timer_tick():void
		{
			this.serverModel.left_time -= 1
			//只有在未连接服务器的时候才自动结束，要不然等服务器的推送才结束
			if(this.serverModel.left_time <= 0 && !this._is_game_over && !GameNet.isConnected())
			{
				this._on_game_over()
			}

			if(this.serverModel.left_time <= 0)
			{
				this._clearGame()
			}

			this._update_left_time()
		}

		private _clearTimer():void
		{
			if(this._timer)
			{
				this._timer.stop();
				this._timer = null
			}
		}

		private _clearGame():void
		{
			this.m_plate_container.visible = false
			this._clearTimer()
			this.removeEventListener(egret.Event.ENTER_FRAME, this._onEnterFrame, this)
		}

		//游戏结束
		private _on_game_over():void
		{
			if(this._is_game_over)
			{
				return
			}
			
			this._is_game_over = true
			this._clearGame()

			//延迟一点时间弹出去
			let platform_finish_delay_time = 2
			KnifeUtils.performDelay(function(){
				GamePlatform.onFinished()
			}.bind(this), platform_finish_delay_time * 1000, this)
		}

		private _update_left_time():void
		{
			this.label_left_time.text = this.serverModel.left_time.toString()
		}

		private _update_player_info():void
		{
			this.label_other_name.text = this.serverModel.otherRole.nickname
			this.label_me_name.text = this.serverModel.myRole.nickname
			// this.serverModel.myRole.icon = "http://192.168.31.145:8083/ac/img/gamehall/ai1.jpg"
			// this.serverModel.otherRole.icon = "http://192.168.31.145:8083/ac/img/gamehall/ai1.jpg"
			if(!DEBUG){
				egret.ImageLoader.crossOrigin = "anonymous" //支持跨域
				if(this.serverModel.myRole.icon){
					this.img_me_icon.source = this.serverModel.myRole.icon
				}
				if(this.serverModel.otherRole.icon){
					this.img_other_icon.source = this.serverModel.otherRole.icon
				}
			}
		}

		private _update_player_round():void
		{
			this.label_me_round.text =  (this.serverModel.myRole.level).toString()
			this.label_other_round.text = (this.serverModel.otherRole.level).toString()
		}

		private onLevelPush(msgId, body):void
		{
			this.serverModel.UpdateRoleLevel(body)
			this._update_player_round()
		}

		private onRefreshPush():void
		{

		}

		private onUsePropPush(msgId, body):void
		{
			let prop = body['prop']
			this.ShowOtherPropEffect(prop)
		}

		public ShowOtherPropEffect(prop_id:number):void
		{
			let __this = this
			if(prop_id == KnifeConst.PROP_WIND){
				this._wind_armatureDisplay.visible = true
				this._wind_armatureDisplay.animation.stop()
				this._wind_armatureDisplay.animation.play("xuanzhuan", -1)
				KnifeUtils.performDelay(function(){
					__this._wind_armatureDisplay.visible = false
					__this._wind_armatureDisplay.animation.stop()
				}.bind(this), 3 * 1000, this)
			} else if(prop_id == KnifeConst.PROP_OTHER_KNIFE){
				this.m_plate_object.WaitToInsertNewKnife()
			}
		}


		public ShowMyKnifePropEffect(x:number, y:number):void
		{
			this._knife_shadow_armatureDisplay.visible = true
			this._knife_shadow_armatureDisplay.animation.stop()
			this._knife_shadow_armatureDisplay.animation.play('knife_shadow_animation', 1)

			this._explosion_armatureDisplay.visible = true
			this._explosion_armatureDisplay.animation.stop()
			this._explosion_armatureDisplay.animation.play('explosion_animation', 1)
			this._explosion_armatureDisplay.x = x
			this._explosion_armatureDisplay.y = y
		}

		private is_connecting:boolean = false
		private onDisconnected():void
		{
			this.m_offline_tips.visible = true
			if(this._is_game_over){
				return
			}
			GameNet.onDisconnected = this.onDisconnected.bind(this)
			if(this.is_connecting){
				let __this = this
				KnifeUtils.performDelay(function(){
					if(this._is_game_over){
						return
					}
					if(GameNet.isConnected()){
						return
					}
					__this.is_connecting = true
					__this.reconnect()
				}.bind(this), 3 * 1000, this)
				return
			}
			this.is_connecting = true
			this.reconnect()
		}

		private async reconnect()
		{
			await GameNet.connectServer()
			await GameNet.reqLogin(User.roomId)
			//断线重连 同步我的分数给服务器
			await GameNet.reqReEnter(this.serverModel.myRole.level)
			this.is_connecting = false
			this.m_offline_tips.visible = false
		}

		private onJoinPush():void
		{

		}

		private onGameStatusPush():void
		{

		}

		private _real_join(body):void
		{
			GamePlatform.onStarted(function(){}.bind(this)); //onStarted
			if(body['player_list'])
			{
				let player_list:Array<Object> = body['player_list'] as Array<Object>
				if(player_list && player_list.length > 0)
				{
					for(let index = 0; index < player_list.length; index ++)
					{
						this.serverModel.AddRole(player_list[index])
					}
				}

				this.StartGame()
			}
		}

		private onGameStartPush(msgId, body):void
		{
			if(!this._waiting_join){
				this._real_join(body)
				return	
			}
			let __this = this
			KnifeUtils.performDelay(function(){
				__this._real_join(body)
			}.bind(this), 1 * 1000, this)
		}

		private onGameSecondPush(msgId, body):void
		{
			let left_time = body['second']
			if(Math.abs(left_time - this.serverModel.left_time) > 2){
				this.serverModel.left_time = left_time
			}
		}

		private onGameScorePush(msgId, body):void
		{
		}

		private onGameOverPush():void
		{
			this._on_game_over()
		}

		private onGameReEnterPush():void
		{

		}

		public onOpen():void
		{
			super.onOpen()

			let protocol = io.GameNet.GAME_PROTOCOL;
			GameNet.on(protocol.CMD_H5_KNIFE_LEVEL_PUSH, this.onLevelPush.bind(this));
			GameNet.on(protocol.CMD_H5_KNIFE_REFRESH_PUSH, this.onRefreshPush.bind(this));
			GameNet.on(protocol.CMD_H5_KNIFE_USEPROP_PUSH, this.onUsePropPush.bind(this));

			GameNet.on(protocol.CMD_H5_JOIN_PUSH, this.onJoinPush.bind(this)); //游戏进入推送
			GameNet.on(protocol.CMD_H5_GAME_STATUS_PUSH, this.onGameStatusPush.bind(this));  //游戏状态推送
			GameNet.on(protocol.CMD_H5_GAME_START_PUSH, this.onGameStartPush.bind(this)); //游戏开始推送
			GameNet.on(protocol.CMD_H5_SECOND_PUSH, this.onGameSecondPush.bind(this)); //游戏时间推送
			GameNet.on(protocol.CMD_H5_SCORE_PUSH, this.onGameScorePush.bind(this)); //游戏分数推送
			GameNet.on(protocol.CMD_H5_GAME_OVER_PUSH, this.onGameOverPush.bind(this)); //游戏结束推送
			GameNet.on(protocol.CMD_H5_REENTER_PUSH, this.onGameReEnterPush.bind(this)); //游戏重进推送

			GameNet.onDisconnected = this.onDisconnected.bind(this)

			GamePlatform.onInit(); //onInit
			this.run();
			this._waiting_join = true
			let __this = this
			KnifeUtils.performDelay(function(){
				__this._waiting_join = false
			}.bind(this), 1 * 1000, this)
			GamePlatform.onWaiting(function(){}.bind(this)); //onWaiting
		}

		private async run() {
			await GameNet.connectServer();
			await GameNet.reqLogin(User.roomId);
			await GameNet.reqJoin();
		}
	}
}
