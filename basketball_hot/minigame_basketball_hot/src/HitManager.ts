class HitManager {

	private mainPanel:MainScenePanel
	private _isOnFloor:boolean = false;
	private _hitType:HitType = HitType.None
	public constructor(_mainPanel:MainScenePanel) {
		this.mainPanel = _mainPanel
	}

	public IsOnFloor():boolean
	{
		return this._isOnFloor;
	}

	public GetHitType():HitType
	{
		return this._hitType
	}

	public _getLastHitType():HitType
	{
		return this.mainPanel.GetPlayerBall().getLastHitType()
	}

	private _global_right_line_circle_point:egret.Point = new egret.Point()
	private _global_right_line_radius:number = 0;

	private _global_left_line_circle_point:egret.Point = new egret.Point()
	private _global_left_line_radius:number = 0;

	private _global_board_top_circle_point:egret.Point = new egret.Point()
	private _global_borad_top_radius:number = 0;
	
	private _global_board_down_circle_point:egret.Point = new egret.Point()
	private _global_borad_down_radius:number = 0;

	private _global_left_top_net_scope_point:egret.Point = new egret.Point()
	private _global_right_down_net_scope_point:egret.Point = new egret.Point()

	public EnterNextRound():void
	{
		let right_line_right_point:egret.Point = new egret.Point();
		this.mainPanel.m_right_line.parent.localToGlobal(this.mainPanel.m_right_line.x + this.mainPanel.m_right_line.width, this.mainPanel.m_right_line.y , right_line_right_point);
		let right_line_left_point:egret.Point = new egret.Point();
		this.mainPanel.m_right_line.parent.localToGlobal(this.mainPanel.m_right_line.x, this.mainPanel.m_right_line.y, right_line_left_point);

		this._global_right_line_circle_point.x = (right_line_left_point.x + right_line_right_point.x) / 2
		this._global_right_line_circle_point.y = (right_line_left_point.y + right_line_right_point.y) / 2

		if(this._global_right_line_radius == 0){
			let right_circle = Math.abs(this._global_right_line_circle_point.x - right_line_left_point.x)
			this._global_right_line_radius = right_circle
		}

		let left_line_right_point:egret.Point = new egret.Point();
		this.mainPanel.m_left_line.parent.localToGlobal(this.mainPanel.m_left_line.x + this.mainPanel.m_left_line.width, this.mainPanel.m_left_line.y , left_line_right_point);
		let left_line_left_point:egret.Point = new egret.Point();
		this.mainPanel.m_left_line.parent.localToGlobal(this.mainPanel.m_left_line.x, this.mainPanel.m_left_line.y, left_line_left_point);

		this._global_left_line_circle_point.x = (left_line_left_point.x + left_line_right_point.x) / 2
		this._global_left_line_circle_point.y = (left_line_left_point.y + left_line_right_point.y) / 2

		if(this._global_left_line_radius == 0){
			let left_circle = Math.abs(this._global_left_line_circle_point.x - left_line_left_point.x)
			this._global_left_line_radius = left_circle
		}

		let left_top_point:egret.Point = new egret.Point()
		this.mainPanel.m_board_top_circle.localToGlobal(0, 0, left_top_point);
		this.mainPanel.m_board_top_circle.localToGlobal(this.mainPanel.m_board_down_circle.width / 2, this.mainPanel.m_board_down_circle.height / 2, this._global_board_top_circle_point);
		if(this._global_borad_top_radius == 0){
			let left_circle = Math.abs(this._global_board_top_circle_point.x - left_top_point.x)
			this._global_borad_top_radius = left_circle
		}

		left_top_point = new egret.Point()
		this.mainPanel.m_board_down_circle.localToGlobal(0, 0, left_top_point);
		this.mainPanel.m_board_down_circle.localToGlobal(this.mainPanel.m_board_down_circle.width / 2, this.mainPanel.m_board_down_circle.height / 2, this._global_board_down_circle_point);
		if(this._global_borad_down_radius == 0){
			let left_circle = Math.abs(this._global_board_down_circle_point.x - left_top_point.x)
			this._global_borad_down_radius = left_circle
		}

		this.mainPanel.m_net_scope.localToGlobal(0, 0, this._global_left_top_net_scope_point)
		this.mainPanel.m_net_scope.localToGlobal(this.mainPanel.m_net_scope.width, this.mainPanel.m_net_scope.height, this._global_right_down_net_scope_point)
	}

	public CheckHit():boolean
	{
		this._hitType = HitType.None
		if(this.CheckHitFloor())
		{
			return true
		}

		// if(this.CheckHitRightLine())
		// {
		// 	return true;
		// }


		if(this.CheckHitRightCirlce())
		{
			return true;
		}

		// if(this.CheckLeftLine())
		// {
		// 	return true;
		// }

		if(this.CheckHitLeftCircle())
		{
			return true;
		}

		if(this.CheckHitBoardCircle())
		{
			return true;
		}

		if(this.CheckHitBoardLines())
		{
			return true;
		}
		return false;
	}

	private HandleBallHit(localBallHitPoint:egret.Point, hitType:HitType)
	{
		let restition = HitConst.getHitRestitution(hitType)
		let friction = HitConst.getHitFriction(hitType)
		
		let speed_vec = new egret.Point(this.mainPanel.GetPlayerBall().basketball_speed_x, this.mainPanel.GetPlayerBall().basketball_speed_y);

		let global_ball_center_point = this.mainPanel.m_basket_ball.localToGlobal(this.mainPanel.m_basket_ball.width / 2, this.mainPanel.m_basket_ball.height / 2);
		let global_hit_point = this.mainPanel.m_basket_ball.localToGlobal(localBallHitPoint.x, localBallHitPoint.y)
		let hit_vec = new egret.Point(global_hit_point.x - global_ball_center_point.x, global_hit_point.y - global_ball_center_point.y)
		hit_vec.normalize(1)
		let dot_vallue = (speed_vec.x * hit_vec.x + speed_vec.y * hit_vec.y)
		let dot_vec = new egret.Point(dot_vallue * hit_vec.x, dot_vallue * hit_vec.y)
		let vertical_vec:egret.Point = new egret.Point(speed_vec.x - dot_vec.x, speed_vec.y - dot_vec.y)

		let restitution_dot_vec = new egret.Point(restition * dot_vec.x, restition * dot_vec.y);
		let friction_vec = new egret.Point(friction * vertical_vec.x, friction * vertical_vec.y);

		let target_speed = new egret.Point(restitution_dot_vec.x + friction_vec.x, restitution_dot_vec.y + friction_vec.y)


		if(hitType != HitType.Floor){
			if(Math.abs(target_speed.x) < 1 * HitConst.Factor){  //这类调整一下速度，避免x速度太小，不能移动
				let rate = 1
				if(target_speed.x != 0){
					rate = target_speed.x / Math.abs(target_speed.x)
				}
				target_speed.x = 1 * HitConst.Factor * rate
			}

			if(target_speed.y < 0 && Math.abs(target_speed.y) < HitConst.Gravity){
				let target_y = -1 * HitConst.Gravity - 2 * HitConst.Factor
				target_speed.y = target_y
			}
		}
		this._hitType = hitType

		this.mainPanel.GetPlayerBall().basketball_speed_x = target_speed.x
		this.mainPanel.GetPlayerBall().basketball_speed_y = target_speed.y
	}

	private CheckHitFloor():boolean
	{
		let curr_y = this.mainPanel.m_basket_ball.y;
		if(curr_y >= this.mainPanel.m_floor.y - this.mainPanel.m_basket_ball.height)
		{
			this.HandleBallHit(new egret.Point(this.mainPanel.m_basket_ball.width / 2, this.mainPanel.m_basket_ball.height), HitType.Floor);

			//掉到地上，解决x速度太快的问题。
			this.mainPanel.GetPlayerBall().basketball_speed_x = Math.max(this.mainPanel.GetPlayerBall().basketball_speed_x, -1 * HitConst.Max_Speed_X)
			this.mainPanel.GetPlayerBall().basketball_speed_x = Math.min(this.mainPanel.GetPlayerBall().basketball_speed_x, HitConst.Max_Speed_X)

			if(this.mainPanel.HasThisRoundTouch() && !this.mainPanel.HasGoal()){
				if(this.mainPanel.IsFaceLeft()){
					this.mainPanel.GetPlayerBall().basketball_speed_x = HitConst.Max_Speed_X * -1;
				} else {
					this.mainPanel.GetPlayerBall().basketball_speed_x = HitConst.Max_Speed_X;
				}
			}

			//进球掉到地板上x速度太慢而停下来的问题，这里给一个小的速度
			if(this.mainPanel.HasGoal() && Math.abs(this.mainPanel.GetPlayerBall().basketball_speed_x) < 3 * HitConst.Factor){
				this.mainPanel.GetPlayerBall().basketball_speed_x = 3 * HitConst.Factor * this.mainPanel.GetPlayerBall().basketball_speed_x / Math.abs(this.mainPanel.GetPlayerBall().basketball_speed_x)
			}
			return true;
		}
		return false;
	}
	/**********************新的圆形判定框  begin******************************* */
	private CheckHitBoardLines():boolean
	{
		let global_ball_left_top_point:egret.Point = new egret.Point();
		this.mainPanel.m_basket_ball.localToGlobal(0, 0, global_ball_left_top_point);

		let global_ball_right_down_point:egret.Point = new egret.Point();
		this.mainPanel.m_basket_ball.localToGlobal(this.mainPanel.m_basket_ball.width, this.mainPanel.m_basket_ball.width, global_ball_right_down_point);

		let global_ball_center_point:egret.Point = new egret.Point();
		this.mainPanel.m_basket_ball.localToGlobal(this.mainPanel.m_basket_ball.width / 2, this.mainPanel.m_basket_ball.width / 2, global_ball_center_point);

		let board_left_top_point:egret.Point = new egret.Point();
		this.mainPanel.m_board_scope.parent.localToGlobal(this.mainPanel.m_board_scope.x, this.mainPanel.m_board_scope.y + 20, board_left_top_point);

		let board_right_down_point:egret.Point = new egret.Point();
		this.mainPanel.m_board_scope.parent.localToGlobal(this.mainPanel.m_board_scope.x + this.mainPanel.m_board_scope.width, this.mainPanel.m_board_scope.y + this.mainPanel.m_board_scope.height - 20, board_right_down_point);

		if(!this.mainPanel.IsFaceLeft())
		{
			HitConst.SwapPointXY(board_left_top_point, board_right_down_point)
		}
		//is right ok
		if(global_ball_left_top_point.x > board_right_down_point.x)
		{
			return false;
		}
		//is left ok
		if(global_ball_right_down_point.x < board_left_top_point.x)
		{
			return false;
		}

		//is top ok
		if(global_ball_right_down_point.y < board_left_top_point.y)
		{
			return false;
		}

		//is down ok
		if(global_ball_left_top_point.y > board_right_down_point.y)
		{
			return false;
		}

		//去除x,y都满足。但是组合起来就不满足的情况
		if(global_ball_center_point.y > board_right_down_point.y)  //在下方
		{
			let delta_y = global_ball_center_point.y - board_right_down_point.y
			let down_line_cirle_width = Math.sqrt(Math.pow(this.mainPanel.m_basket_ball.width / 2, 2) - Math.pow(delta_y, 2))
			if(global_ball_center_point.x > board_right_down_point.x){
				if(global_ball_center_point.x - board_right_down_point.x > down_line_cirle_width){
					return false
				}
			} else if(global_ball_center_point.x < board_left_top_point.x){
				if(board_left_top_point.x - global_ball_center_point.x > down_line_cirle_width){
					return false
				}
			}
		}
		else if(global_ball_center_point.y < board_left_top_point.y) //在上方
		{
			let delta_y = global_ball_center_point.y - board_left_top_point.y
			let top_line_cirle_width = Math.sqrt(Math.pow(this.mainPanel.m_basket_ball.width / 2, 2) - Math.pow(delta_y, 2))
			if(global_ball_center_point.x > board_right_down_point.x){
				if(global_ball_center_point.x - board_right_down_point.x > top_line_cirle_width){
					return false
				}
			} else if(global_ball_center_point.x < board_left_top_point.x){
				if(board_left_top_point.x - global_ball_center_point.x > top_line_cirle_width){
					return false
				}
			}
		}
		
		//以下都满足碰撞

		let is_top = global_ball_center_point.y < board_left_top_point.y
		let is_down = global_ball_center_point.y > board_right_down_point.y
		//左右两边的碰撞
		if(global_ball_center_point.x < board_left_top_point.x || global_ball_center_point.x > board_right_down_point.x){
			let is_right = global_ball_center_point.x > board_right_down_point.x
			if(is_right){
				this.HandleBallHit(new egret.Point(0, this.mainPanel.m_basket_ball.height / 2), HitType.Board_Left_Right)
			}else{
				this.HandleBallHit(new egret.Point(this.mainPanel.m_basket_ball.width, this.mainPanel.m_basket_ball.height / 2), HitType.Board_Left_Right)
			}
			return true;
		}
		return false;
	}

	private CheckHitBoardCircle():boolean
	{
		let global_ball_left_top_point:egret.Point = new egret.Point();
		this.mainPanel.m_basket_ball.localToGlobal(0, 0, global_ball_left_top_point);

		let global_ball_right_down_point:egret.Point = new egret.Point();
		this.mainPanel.m_basket_ball.localToGlobal(this.mainPanel.m_basket_ball.width, this.mainPanel.m_basket_ball.width, global_ball_right_down_point);

		let global_ball_center_point:egret.Point = new egret.Point();
		this.mainPanel.m_basket_ball.localToGlobal(this.mainPanel.m_basket_ball.width / 2, this.mainPanel.m_basket_ball.width / 2, global_ball_center_point);

		let ball_radius = Math.abs(global_ball_center_point.x - global_ball_left_top_point.x)
		let distance = Math.sqrt(Math.pow(global_ball_center_point.x - this._global_board_top_circle_point.x, 2) + Math.pow(global_ball_center_point.y - this._global_board_top_circle_point.y, 2))
		if(distance <= this._global_borad_top_radius + ball_radius){
			let hit_vec = new egret.Point(this._global_board_top_circle_point.x - global_ball_center_point.x, this._global_board_top_circle_point.y - global_ball_center_point.y)
			hit_vec.normalize(1)

			let global_hit_point = new egret.Point(global_ball_center_point.x + hit_vec.x * ball_radius, global_ball_center_point.y + hit_vec.y * ball_radius)
			let local_hit_point = new egret.Point()
			this.mainPanel.m_basket_ball.globalToLocal(global_hit_point.x, global_hit_point.y, local_hit_point)

			this.HandleBallHit(local_hit_point, HitType.Board_Top);
			return true
		}

		distance = Math.sqrt(Math.pow(global_ball_center_point.x - this._global_board_down_circle_point.x, 2) + Math.pow(global_ball_center_point.y - this._global_board_down_circle_point.y, 2))
		if(distance <= this._global_borad_down_radius + ball_radius){
			let hit_vec = new egret.Point(this._global_board_down_circle_point.x - global_ball_center_point.x, this._global_board_down_circle_point.y - global_ball_center_point.y)
			hit_vec.normalize(1)

			let global_hit_point = new egret.Point(global_ball_center_point.x + hit_vec.x * ball_radius, global_ball_center_point.y + hit_vec.y * ball_radius)
			let local_hit_point = new egret.Point()
			this.mainPanel.m_basket_ball.globalToLocal(global_hit_point.x, global_hit_point.y, local_hit_point)

			this.HandleBallHit(local_hit_point, HitType.Board_Top);
			return true
		}

		return false;
	}

	private CheckHitRightCirlce():boolean
	{
		let global_ball_left_top_point:egret.Point = new egret.Point();
		this.mainPanel.m_basket_ball.localToGlobal(0, 0, global_ball_left_top_point);

		let global_ball_right_down_point:egret.Point = new egret.Point();
		this.mainPanel.m_basket_ball.localToGlobal(this.mainPanel.m_basket_ball.width, this.mainPanel.m_basket_ball.width, global_ball_right_down_point);

		let global_ball_center_point:egret.Point = new egret.Point();
		this.mainPanel.m_basket_ball.localToGlobal(this.mainPanel.m_basket_ball.width / 2, this.mainPanel.m_basket_ball.width / 2, global_ball_center_point);

		let ball_radius = Math.abs(global_ball_center_point.x - global_ball_left_top_point.x)
		let distance = Math.sqrt(Math.pow(global_ball_center_point.x - this._global_right_line_circle_point.x, 2) + Math.pow(global_ball_center_point.y - this._global_right_line_circle_point.y, 2))
		if(distance > this._global_right_line_radius + ball_radius){
			return false
		}

		let hit_vec = new egret.Point(this._global_right_line_circle_point.x - global_ball_center_point.x, this._global_right_line_circle_point.y - global_ball_center_point.y)
		hit_vec.normalize(1)

		let global_hit_point = new egret.Point(global_ball_center_point.x + hit_vec.x * ball_radius, global_ball_center_point.y + hit_vec.y * ball_radius)
		let local_hit_point = new egret.Point()
		this.mainPanel.m_basket_ball.globalToLocal(global_hit_point.x, global_hit_point.y, local_hit_point)

		this.HandleBallHit(local_hit_point, HitType.Right_Line);
		return true;
	}

	private CheckHitLeftCircle():boolean
	{
		let global_ball_left_top_point:egret.Point = new egret.Point();
		this.mainPanel.m_basket_ball.localToGlobal(0, 0, global_ball_left_top_point);

		let global_ball_right_down_point:egret.Point = new egret.Point();
		this.mainPanel.m_basket_ball.localToGlobal(this.mainPanel.m_basket_ball.width, this.mainPanel.m_basket_ball.width, global_ball_right_down_point);

		let global_ball_center_point:egret.Point = new egret.Point();
		this.mainPanel.m_basket_ball.localToGlobal(this.mainPanel.m_basket_ball.width / 2, this.mainPanel.m_basket_ball.width / 2, global_ball_center_point);

		
		let ball_radius = Math.abs(global_ball_center_point.x - global_ball_left_top_point.x)
		let distance = Math.sqrt(Math.pow(global_ball_center_point.x - this._global_left_line_circle_point.x, 2) + Math.pow(global_ball_center_point.y - this._global_left_line_circle_point.y, 2))
		if(distance > this._global_left_line_radius + ball_radius){
			return false
		}

		let hit_vec = new egret.Point(this._global_left_line_circle_point.x - global_ball_center_point.x, this._global_left_line_circle_point.y - global_ball_center_point.y)
		hit_vec.normalize(1)

		let global_hit_point = new egret.Point(global_ball_center_point.x + hit_vec.x * ball_radius, global_ball_center_point.y + hit_vec.y * ball_radius)
		let local_hit_point = new egret.Point()
		this.mainPanel.m_basket_ball.globalToLocal(global_hit_point.x, global_hit_point.y, local_hit_point)

		this.HandleBallHit(local_hit_point, HitType.Left_Line);
		return true;
	}

	/**********************新的圆形判定框  end******************************* */

	private CheckHitRightLine():boolean
	{
		let global_ball_left_top_point:egret.Point = new egret.Point();
		this.mainPanel.m_basket_ball.localToGlobal(0, 0, global_ball_left_top_point);

		let global_ball_right_down_point:egret.Point = new egret.Point();
		this.mainPanel.m_basket_ball.localToGlobal(this.mainPanel.m_basket_ball.width, this.mainPanel.m_basket_ball.width, global_ball_right_down_point);

		let global_ball_center_point:egret.Point = new egret.Point();
		this.mainPanel.m_basket_ball.localToGlobal(this.mainPanel.m_basket_ball.width / 2, this.mainPanel.m_basket_ball.width / 2, global_ball_center_point);

		let right_line_right_point:egret.Point = new egret.Point();
		this.mainPanel.m_right_line.parent.localToGlobal(this.mainPanel.m_right_line.x + this.mainPanel.m_right_line.width, this.mainPanel.m_right_line.y, right_line_right_point);

		let right_line_left_point:egret.Point = new egret.Point();
		this.mainPanel.m_right_line.parent.localToGlobal(this.mainPanel.m_right_line.x, this.mainPanel.m_right_line.y, right_line_left_point);

		if(!this.mainPanel.IsFaceLeft())  //对称
		{
			HitConst.SwapPoint(right_line_right_point, right_line_right_point)
		}

		//is right ok
		if(global_ball_left_top_point.x > right_line_right_point.x)
		{
			return false;
		}
		//is left ok
		if(global_ball_right_down_point.x < right_line_left_point.x)
		{
			return false;
		}

		//is top ok
		if(global_ball_right_down_point.y < right_line_left_point.y)
		{
			return false;
		}

		//is down ok
		if(global_ball_left_top_point.y > right_line_left_point.y)
		{
			return false;
		}

		//去除x,y都满足。但是组合起来就不满足的情况

		let delta_y = global_ball_center_point.y - right_line_left_point.y
		let top_line_cirle_width = Math.sqrt(Math.pow(this.mainPanel.m_basket_ball.width / 2, 2) - Math.pow(delta_y, 2))
		if(global_ball_center_point.x > right_line_right_point.x){
			if(global_ball_center_point.x - right_line_right_point.x > top_line_cirle_width){
				return false
			}
		} else if(global_ball_center_point.x < right_line_left_point.x){
			if(right_line_left_point.x - global_ball_center_point.x > top_line_cirle_width){
				return false
			}
		}

		//以下必定相交
		if(global_ball_center_point.x > right_line_right_point.x){
			let global_hit_point = new egret.Point(global_ball_center_point.x - top_line_cirle_width, right_line_left_point.y)
			let local_hit_point = new egret.Point()
			this.mainPanel.m_basket_ball.globalToLocal(global_hit_point.x, global_hit_point.y, local_hit_point)
			this.HandleBallHit(local_hit_point, HitType.Right_Line)
			return true;
		}

		if(global_ball_center_point.x < right_line_left_point.x){
			let global_hit_point = new egret.Point(global_ball_center_point.x + top_line_cirle_width, right_line_left_point.y)
			let local_hit_point = new egret.Point()
			this.mainPanel.m_basket_ball.globalToLocal(global_hit_point.x, global_hit_point.y, local_hit_point)
			this.HandleBallHit(local_hit_point, HitType.Right_Line)
			return true;
		}

		//中间碰撞了
		this.HandleBallHit(new egret.Point(this.mainPanel.m_basket_ball.width / 2, this.mainPanel.m_basket_ball.height), HitType.Right_Line)
		return true;
	}

	private CheckLeftLine():boolean
	{
		let global_ball_left_top_point:egret.Point = new egret.Point();
		this.mainPanel.m_basket_ball.localToGlobal(0, 0, global_ball_left_top_point);

		let global_ball_right_down_point:egret.Point = new egret.Point();
		this.mainPanel.m_basket_ball.localToGlobal(this.mainPanel.m_basket_ball.width, this.mainPanel.m_basket_ball.width, global_ball_right_down_point);

		let global_ball_center_point:egret.Point = new egret.Point();
		this.mainPanel.m_basket_ball.localToGlobal(this.mainPanel.m_basket_ball.width / 2, this.mainPanel.m_basket_ball.width / 2, global_ball_center_point);

		let left_line_right_point:egret.Point = new egret.Point();
		this.mainPanel.m_right_line.parent.localToGlobal(this.mainPanel.m_left_line.x + this.mainPanel.m_left_line.width, this.mainPanel.m_left_line.y, left_line_right_point);

		let left_line_left_point:egret.Point = new egret.Point();
		this.mainPanel.m_right_line.parent.localToGlobal(this.mainPanel.m_left_line.x, this.mainPanel.m_left_line.y, left_line_left_point);

		if(!this.mainPanel.IsFaceLeft())  //对称
		{
			HitConst.SwapPoint(left_line_right_point, left_line_left_point)
		}

		//is right ok
		if(global_ball_left_top_point.x > left_line_right_point.x)
		{
			return false;
		}
		//is left ok
		if(global_ball_right_down_point.x < left_line_left_point.x)
		{
			return false;
		}

		//is top ok
		if(global_ball_right_down_point.y < left_line_left_point.y)
		{
			return false;
		}

		//is down ok
		if(global_ball_left_top_point.y > left_line_left_point.y)
		{
			return false;
		}

		//去除x,y都满足。但是组合起来就不满足的情况

		let delta_y = global_ball_center_point.y - left_line_left_point.y
		let top_line_cirle_width = Math.sqrt(Math.pow(this.mainPanel.m_basket_ball.width / 2, 2) - Math.pow(delta_y, 2))
		if(global_ball_center_point.x > left_line_right_point.x){
			if(global_ball_center_point.x - left_line_right_point.x > top_line_cirle_width){
				return false
			}
		} else if(global_ball_center_point.x < left_line_left_point.x){
			if(left_line_left_point.x - global_ball_center_point.x > top_line_cirle_width){
				return false
			}
		}

		//以下必定相交
		if(this.mainPanel.IsFaceLeft()){
			if(global_ball_center_point.x > left_line_right_point.x){

				let global_hit_point = new egret.Point(global_ball_center_point.x - top_line_cirle_width, left_line_right_point.y)
				let local_hit_point = new egret.Point()
				this.mainPanel.m_basket_ball.globalToLocal(global_hit_point.x, global_hit_point.y, local_hit_point)
				this.HandleBallHit(local_hit_point, HitType.Left_Line)
				return true;
			}
		} else { 
			if(global_ball_center_point.x < left_line_left_point.x){

				let global_hit_point = new egret.Point(global_ball_center_point.x + top_line_cirle_width, left_line_right_point.y)
				let local_hit_point = new egret.Point()
				this.mainPanel.m_basket_ball.globalToLocal(global_hit_point.x, global_hit_point.y, local_hit_point)
				this.HandleBallHit(local_hit_point, HitType.Left_Line)
				return true;
			}
		}

		//不打算处理在左边和中间的情况，因为这不可能发生，就算发生了也不正常，让篮框的挡板去碰撞。
		return false;
	}

	

	private CheckHitBoard():boolean
	{
		let global_ball_left_top_point:egret.Point = new egret.Point();
		this.mainPanel.m_basket_ball.localToGlobal(0, 0, global_ball_left_top_point);

		let global_ball_right_down_point:egret.Point = new egret.Point();
		this.mainPanel.m_basket_ball.localToGlobal(this.mainPanel.m_basket_ball.width, this.mainPanel.m_basket_ball.width, global_ball_right_down_point);

		let global_ball_center_point:egret.Point = new egret.Point();
		this.mainPanel.m_basket_ball.localToGlobal(this.mainPanel.m_basket_ball.width / 2, this.mainPanel.m_basket_ball.width / 2, global_ball_center_point);

		let board_left_top_point:egret.Point = new egret.Point();
		this.mainPanel.m_board_scope.parent.localToGlobal(this.mainPanel.m_board_scope.x, this.mainPanel.m_board_scope.y, board_left_top_point);

		let board_right_down_point:egret.Point = new egret.Point();
		this.mainPanel.m_board_scope.parent.localToGlobal(this.mainPanel.m_board_scope.x + this.mainPanel.m_board_scope.width, this.mainPanel.m_board_scope.y + this.mainPanel.m_board_scope.height, board_right_down_point);

		if(!this.mainPanel.IsFaceLeft())
		{
			HitConst.SwapPointXY(board_left_top_point, board_right_down_point)
		}
		//is right ok
		if(global_ball_left_top_point.x > board_right_down_point.x)
		{
			return false;
		}
		//is left ok
		if(global_ball_right_down_point.x < board_left_top_point.x)
		{
			return false;
		}

		//is top ok
		if(global_ball_right_down_point.y < board_left_top_point.y)
		{
			return false;
		}

		//is down ok
		if(global_ball_left_top_point.y > board_right_down_point.y)
		{
			return false;
		}

		//去除x,y都满足。但是组合起来就不满足的情况
		if(global_ball_center_point.y > board_right_down_point.y)  //在下方
		{
			let delta_y = global_ball_center_point.y - board_right_down_point.y
			let down_line_cirle_width = Math.sqrt(Math.pow(this.mainPanel.m_basket_ball.width / 2, 2) - Math.pow(delta_y, 2))
			if(global_ball_center_point.x > board_right_down_point.x){
				if(global_ball_center_point.x - board_right_down_point.x > down_line_cirle_width){
					return false
				}
			} else if(global_ball_center_point.x < board_left_top_point.x){
				if(board_left_top_point.x - global_ball_center_point.x > down_line_cirle_width){
					return false
				}
			}
		}
		else if(global_ball_center_point.y < board_left_top_point.y) //在上方
		{
			let delta_y = global_ball_center_point.y - board_left_top_point.y
			let top_line_cirle_width = Math.sqrt(Math.pow(this.mainPanel.m_basket_ball.width / 2, 2) - Math.pow(delta_y, 2))
			if(global_ball_center_point.x > board_right_down_point.x){
				if(global_ball_center_point.x - board_right_down_point.x > top_line_cirle_width){
					return false
				}
			} else if(global_ball_center_point.x < board_left_top_point.x){
				if(board_left_top_point.x - global_ball_center_point.x > top_line_cirle_width){
					return false
				}
			}
		}
		
		//以下都满足碰撞

		let is_top = global_ball_center_point.y < board_left_top_point.y
		let is_down = global_ball_center_point.y > board_right_down_point.y
		//左右两边的碰撞
		if(global_ball_center_point.x < board_left_top_point.x || global_ball_center_point.x > board_right_down_point.x){
			let is_right = global_ball_center_point.x > board_right_down_point.x
			if(is_top || is_down){  //上下
				let delta_y = 0
				let target_y = 0
				if(is_top){
					delta_y = global_ball_center_point.y - board_left_top_point.y
					target_y = board_left_top_point.y
				}else{
					delta_y = global_ball_center_point.y - board_right_down_point.y
					target_y = board_right_down_point.y
				}
				
				let line_circle_width =  Math.sqrt(Math.pow(this.mainPanel.m_basket_ball.width / 2, 2) - Math.pow(delta_y, 2))
				let global_hit_point = new egret.Point(global_ball_center_point.x + line_circle_width, target_y)
				if(is_right){
					global_hit_point.x = global_ball_center_point.x - line_circle_width
				}
				let local_hit_point = new egret.Point()
				this.mainPanel.m_basket_ball.globalToLocal(global_hit_point.x, global_hit_point.y, local_hit_point)
				this.HandleBallHit(local_hit_point, HitType.Board)
			} else{//中间
				if(is_right){
					this.HandleBallHit(new egret.Point(0, this.mainPanel.m_basket_ball.height / 2), HitType.Board_Left_Right)
				}else{
					this.HandleBallHit(new egret.Point(this.mainPanel.m_basket_ball.width, this.mainPanel.m_basket_ball.height / 2), HitType.Board_Left_Right)
				}
			}
		} else { //上下
			if(is_top){
				this.HandleBallHit(new egret.Point(this.mainPanel.m_basket_ball.width / 2, this.mainPanel.m_basket_ball.height), HitType.Board_Top)
			} else if(is_down){
				this.HandleBallHit(new egret.Point(this.mainPanel.m_basket_ball.width / 2, 0), HitType.Board_Top)
			} else {
				//解决切换回合篮板互换位置的瞬间，刚好球在篮板的新位置上，这里忽略碰撞
				return false
			}
		}
		return true;
	}


	public CheckHitNet():HitNetType
	{
		let hitNetType = HitNetType.NONE

		let global_ball_left_top_point:egret.Point = new egret.Point();
		this.mainPanel.m_basket_ball.localToGlobal(0, 0, global_ball_left_top_point);
		let global_ball_right_down_point:egret.Point = new egret.Point();
		this.mainPanel.m_basket_ball.localToGlobal(this.mainPanel.m_basket_ball.width, this.mainPanel.m_basket_ball.width, global_ball_right_down_point);

		let global_ball_center_point:egret.Point = new egret.Point();
		this.mainPanel.m_basket_ball.localToGlobal(this.mainPanel.m_basket_ball.width / 2, this.mainPanel.m_basket_ball.width / 2, global_ball_center_point);

		if(!this.mainPanel.IsFaceLeft())
		{
			HitConst.SwapPointXY(this._global_left_top_net_scope_point, this._global_right_down_net_scope_point)
		}

		//is right ok
		if(global_ball_left_top_point.x > this._global_right_down_net_scope_point.x)
		{
			return hitNetType;
		}
		//is left ok
		if(global_ball_right_down_point.x < this._global_left_top_net_scope_point.x)
		{
			return hitNetType;
		}

		//is top ok
		if(global_ball_right_down_point.y < this._global_left_top_net_scope_point.y)
		{
			return hitNetType;
		}

		//is down ok
		if(global_ball_left_top_point.y > this._global_right_down_net_scope_point.y)
		{
			return hitNetType;
		}

		if(global_ball_center_point.x < this._global_left_top_net_scope_point.x){
			return HitNetType.LEFT
		}

		if(global_ball_center_point.x > this._global_right_down_net_scope_point.x){
			return HitNetType.RIGHT
		}

		return HitNetType.CENTER
	}
}