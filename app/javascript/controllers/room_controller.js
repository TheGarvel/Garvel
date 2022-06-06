import { Controller } from "stimulus";
import { createConsumer } from "@rails/actioncable";
import axios from "axios"
export default class extends Controller {

  static targets = [ "message","messagescontainer","currentprice","yourprice","finalprice","biduser" ]
  userArray = []
  userhash = {}
  initialize() {
    let thisController = this;
    this.channel = createConsumer().subscriptions.create( "RoomChannel", {
      connected() {
        thisController.listen()
      },
      received({ bid , message , user, endbid, bidder,race_condition }) {
        if(race_condition != undefined){
          console.log("race_condition");
        }
        if(bid != undefined){
          thisController.currentpriceTargets.map( (currentprice,idx) => {
            currentprice.textContent = bid
            if (idx == 0){
              currentprice.textContent = `最高價：$${bid}`
            }
          })

          thisController.userArray.unshift({id: user,
                                            bid: bid})
          thisController.yourpriceTarget.value = thisController.yourpriceTarget.min
          thisController.biduserTarget.innerHTML = '';

          thisController.asyncForEach(thisController.userArray.slice(0, 6),  async(user) => {
            const user_id = user.id,
                  user_bid = user.bid
            if ( !Object.keys(thisController.userhash).includes(user_id) ){
              thisController.userhash[user_id] = await thisController.getavatar(user_id);
            }
            let imgHtml = `<div class="relative">
                          <img src="${thisController.userhash[user_id]}" class="mx-5 relative font-bold text-white rounded-full bg-gray-600 flex items-center justify-center font-mono" style="height: 50px; width: 50px;"/>
                          <div class="bottom-0" style="clip-path: polygon(25% 0%, 100% 0%, 75% 100%, 0% 100%);background-color: rgb(252 211 77); padding: 0 1.25rem;">${user_bid}</div>
                          </div>`
            thisController.biduserTarget.insertAdjacentHTML("beforeend",imgHtml)
          })

          thisController.updatePrice()
        }

        if(message != undefined){
          (async() => {
            const user_id = user;
            if ( !Object.keys(thisController.userhash).includes(user_id) ){
              thisController.userhash[user_id] = await thisController.getavatar(user_id)
            }
            let messageHtml = `<div class="m-2">
              <img src="${thisController.userhash[user_id]}" class="w-12 h-12 inline-block rounded-full bg-gray-300"/>
              &nbsp&nbsp
              <span class="p-4 rounded-full text-white font-bold bg-blue-500 opacity-90 text-lg"> ${message} </span>
            </div>`;
            thisController.messageTarget.value = ""
            thisController.messagescontainerTarget.insertAdjacentHTML("beforeend",messageHtml)
            thisController.messagescontainerTarget.scrollTop = thisController.messagescontainerTarget.scrollHeight
          })();
        }

        if( endbid == "end" ){
          if(thisController.element.dataset.user == bidder){
            location.href = '/products/own';
          }else{
            location.href = '/';
          }
        }

      },
    });
  }

  updatePrice(){
    this.finalpriceTarget.textContent = Number(this.currentpriceTargets[1].textContent)
    + Number(this.yourpriceTarget.value)
  }

  connect() {
    this.updatePrice()
    this.yourpriceTarget.addEventListener('input', () => { this.updatePrice()});
    this.messageTarget.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.chat()
      }
    });
  }

  disconnect() {
    if (this.channel) {
      this.channel.perform('unfollow')
    }
  }

  bid() {
    if (this.channel) {
      this.channel.perform("bid", {room: this.element.dataset.room,
                                   user: this.element.dataset.user,
                                   price: this.finalpriceTarget.textContent })
    }
  }

  chat() {
    if (this.channel && this.messageTarget.value != '') {
      this.channel.perform("chat", {room: this.element.dataset.room,
                                    user: this.element.dataset.user,
                                    message: this.messageTarget.value.trim() })
    }
  }

  listen() {
    if (this.channel) {
      this.channel.perform('follow', { room: this.element.dataset.room } )
    }
  }

  async getavatar(user_id) {
    try {
      const csrfToken = document.querySelector("meta[name=csrf-token]").content
      axios.defaults.headers.common['X-CSRF-Token'] = csrfToken
      const response = await axios.get(`/api/v1/rooms/getavatar/${user_id}`);
      return response.data;
    } catch (error) {
      console.error(error);
    }
  }
  async asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
  }
}
