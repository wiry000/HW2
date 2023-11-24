const basemanObj={
	props: ["value","ininame","initel"], //will reflect to base.xid
	data(){
		return{
			showDiv:false,
			name:"",
			oldName:"",
			tel:"",
			baseID:0,
			dat:null //xid,name, mark, addr
		}
	},
	methods:{
		updateSuggestion:function(){
			let that=this;
			//ajax to update suggestions
			if (this.oldName != this.name) {
				this.oldName=this.name;
				let url="./bin/_browseFor.py";
				let mydat = new FormData();
				mydat.append( "p",JSON.stringify({'n':this.name}));
				mydat.append( "o", 'baseFindbyName');
				fetch(url,{
					method: 'POST', // or 'PUT'
					body: mydat 										
				})
				.then(function(res){ return res.json();})
				.then(function(data){
					//console.log(that.name,data)
					that.dat=data.rows;
				})
			}
		},
		changeBaseID:function(bID, name='',tel=''){
			this.name=name;
			this.tel=tel;
			this.showDiv=false;
			this.baseID=bID;
			this.$emit('update:value', this.baseID);
			this.$emit('update:ininame', this.name);
			this.$emit('update:initel', this.tel);
		},
		cancelInput: function() {
			this.showDiv=false;
			this.name = this.ininame;
			this.baseID = this.value;
		},
		cleanInput: function() {
			this.changeBaseID(0,'')
		},
		find(bID) {
			this.baseID=bID
			let that=this;
			//ajax to update suggestions
			let url="./bin/_browseFor.py";
			let mydat = new FormData();
			mydat.append( "o", 'baseFindbybID');
			mydat.append( "p", JSON.stringify({'i':bID}));			
			fetch(url,{
				method: 'POST', // or 'PUT'
				body: mydat 										
			})
			.then(function(res){
				return res.json(); })
			.then(function(data){
				that.baseID=data[0].xid;
				that.name=data[0].name;
			})									
		}
	},
	created() {
		//console.log(this.ininame, this.value)
		this.name=this.ininame;
		this.tel=this.initel;
		this.baseID=this.value;
		this.updateSuggestion()
		//this.find(this.value);
	},
	/*
	mounted() {
		offL = this.$refs.myName.getBoundingClientRect().left;
		offT = this.$refs.myName.getBoundingClientRect().bottom;
		console.log(offL,offT)
		this.$refs.sDiv.style.left=offL +"px";
		//this.$refs.sDiv.offsetTop=offT+10;
	}, */
	template: `
	<input ref="myName" type="text" v-model="name" placeholder="輸入姓名查詢"  v-on:keyup="updateSuggestion" @focus="showDiv=true" />
	<span v-if="! showDiv"><span v-if="baseID>0">會員編號:{{baseID}}</span><span v-if="baseID<=0">查無此人</span></span>
	<div ref="sDiv" v-if="showDiv" class="suggestDiv" style="overflow-y:auto;border:3px solid green;background: white;max-height: 100px;">
	<ol >
	<li class='baseLi' v-for='rec in dat' @click='changeBaseID(rec.xid, rec.name, rec.tel)'>{{ rec.name }}({{ rec.mark }}):{{ rec.addr }}</li>
	<li class='baseLi' @click="cancelInput()">...最多顯示50筆資料...按這裡取消查詢</li>
	<li class='baseLi' @click="cleanInput()">...按這裡清空輸入欄位</li>
	</ol>
	</div>`
}


const addrObj={
	props: ["value","zip",'area'],
	data(){
		return{
			city:'',
			areaObj:'',
			zipdata: Object.keys(zip3data),
			listClass: 'baseLi'
		}
	},
	computed:{
		name: function(){
			return zip3data[this.city];
		},
		areaID: function() {
			if (! this.areaObj) {
				this.find_area(this.city);
			}
			//console.log(this.areaObj.zip)
			return this.areaObj.id;
		},
		addr: function(){
			let r=""
			if (this.city) {
				r=this.city;
			}
			if(this.areaObj) {
				r=r+this.areaObj.area
			}
			return r;
		}
	},
	methods:{
		cityChange:function(){
			//reset
			this.areaObj="";
			this.$emit('update:value', this.areaID);
			//must be after the previous emit, find_area must be called first so areaObj will not be null
			this.$emit('update:zip', this.areaObj.zip);
			this.$emit('update:area',this.city);
		},
		areaChange:function(){
			this.$emit('update:value', this.areaID);
			this.$emit('update:zip',this.areaObj.zip);
			this.$emit('update:area',this.city+this.areaObj.area);
		},
		find: function(aID) {
			//console.log("finding aID:",aID)
			for (city in zip3data) {
				for (dat of zip3data[city]) {
					if (dat.id == aID) {
						this.city=city;
						this.areaObj=dat;
						//console.log(dat.area);
						return;
						//console.log(this.addr);
						//console.log(city, area, zip, id)
					}
				}
			}
		},
		find_area(str) {
			const c=str.substr(0,3);
			const a=str.substr(3);
			for (city in zip3data) { //for-in interates key
				if (c == city) {
					this.city=city;
					for (dat of zip3data[city]) {//for-of iterates value
						if (dat.area == a) { 
							this.areaObj=dat;
							return;
							//console.log(this.addr);
							//console.log(city, area, zip, id)
						}
					}
				}
			}			
		}
	},
	created() {
		//console.log(this.value);
		this.find(this.value);
	},
	template: `
	  縣市：
		<select v-model="city" v-on:change="cityChange">
		<!-- <option value='' selected>請選擇</option> -->
		<option v-for="item in zipdata" :value="item">{{item}}</option>
		</select>

	  鄉鎮區：
	  <select v-model="areaObj" v-if="city" v-on:change="areaChange">
		<!-- <option value='' selected>請選擇</option> -->
		<option v-for="item in name" :value="item">{{item.area}}</option>
	  </select>`
}

//depends on global obj: srvOpts, deptOpts[sID]
const srvdObj={
	props: ["srv","dept"],
	data(){
		return{
			sID:'',
			dID:'',
			note:'',
			srvObj: srvOpts //Object.keys(zip3data),
		}
	},
	computed:{
		deptList: function(){
			if (this.sID in deptOpts) {
				return deptOpts[this.sID];
			} else {
				return [];
			}
		}
	},
	methods:{
		srvChange:function(){
			//reset
			this.dID="0";
			this.note="";
			this.$emit('update:srv', this.sID);
			this.$emit('update:dept', this.dID);
		},
		deptChange:function(){
			this.$emit('update:dept', this.dID);
		}
	}, 
	created() {
		//console.log(100);
		this.sID=this.srv;
		this.dID=this.dept;
	},
	template: `
		服務處：
		<select v-model="sID" v-on:change="srvChange">
		<!-- <option value='0' selected>請選擇</option> -->
		<option v-for="item in srvObj" :value="item.v">{{item.o}}</option>
		</select>
		辦事處：
		<select v-model="dID" v-if="sID>'0'" v-on:change="deptChange">
		<!-- <option value='0' selected>請選擇</option> -->
		<option v-for="item in deptList" :value="item.v">{{item.o}}</option>
		</select>`
}

//depends on global obj: srvOpts, deptOpts[sID]
const interestsObj={
	props: ["value"],
	data(){
		return{
			interests:'',
			selOption:'',
			myList: interestOpts
		}
	},
	methods:{
		listChange:function(){
			idx=this.interests.indexOf(this.selOption)
			if (idx < 0) { //not exist, append it
				this.interests += this.selOption+"\n"
				this.$emit('update:value', this.interests);
			}
		},
		textChange:function(){
			this.$emit('update:value', this.interests);
		}
	},
	created() {
		//console.log(this.value);
		this.interests=this.value;
	},
	template: `
		點選要新增的項目：
		<select size='4' v-model="selOption" v-on:change="listChange">
		<option v-for="item in myList" :value="item">{{item}}</option>
		</select>

		意願：
		<textarea rows='4' v-model="interests" v-on:change="textChange"></textarea>
		`
}

function browseFor(rptID,param={},callback=null) {
	setMainDiv('main');
	let elmnt = document.getElementById('main');
	if (elmnt) {
		elmnt.innerHTML = "<div id='browseFor' class='browseFor'></div>";
		//now to fecth the results
		let url="bin/_browseFor.py";
		let mydat = new FormData();
		//console.log(param, rptID)
		openDialog("處理中，請稍候...",null,false)
		mydat.append( "p", JSON.stringify(param));
		mydat.append( "o", rptID);
		fetch(url,{
			method: 'POST',
			body: mydat
		})
		.then(function(resp){
			closeDialog()
			return resp.json();})
			//return resp.text();})
		.then(function(json) {
			//console.log(json)
			//return;
		browseForApp=Vue.createApp( {
			data() {
				return {
					callback: callback,					
					dat: json //dat.header, dat.rows
				}
			},
			computed: {
				hasCallback: function() {
					return (typeof this.callback === 'function');
				}
			},
			methods: {
				set: function(data) {
					this.dat=data;
				},
				runCallback: function(obj) {
					id=obj[Object.keys(obj)[0]]
					if (confirm('要對 [' + id + '] 執行操作嗎?')) {
						if ('active' in obj) {
							obj['active'] = ! obj['active'] 
						}
						this.callback(id,obj);
					}
				}
			},
			template:`
  <h3>{{dat.title}}</h3></button><hr>
  <table id='browseForResults' class='browseForResults'>
  <thead>
	<tr >
	  <th v-for="item in dat.header">{{item}}</th>
	  <th>-</th>
	</tr>
  </thead>
  <tbody>
	<tr v-for='row in dat.rows' >
		<td v-for='item in dat.header'>{{ row[item] }}</td>
		<td>
		<button v-if="hasCallback" @click='runCallback(row)'>設定</button> 
		</td>
	</tr>
   </tbody>
</table><br><button onclick="setMainDiv('search');">Close</button>`
		});

		browseForVM = browseForApp.mount("#browseFor");
		closeDialog();
		})
		return;
	}
}
