const socket=io()

//element
const $messageform= document.querySelector('#message-form')
const $messageformInpute= document.querySelector('input')
const $messageformButton= document.querySelector('button')
const $sendLocationButton= document.querySelector('#send-location')
const $messages= document.querySelector('#messages')

//template
const messageTemplate= document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

// Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

socket.on('message', (message) => {
     const html = Mustache.render(messageTemplate, {
        username:message.username,
        message:message.text,
        createdAt:moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
})

const autoscroll=()=>{
    const $newmessage=$messages.lastElementChild
    const newMessageStyles=getComputedStyle($newmessage)
    const newMessageHeight=$newmessage.offsetheight+ newmessagemargin
    const newmessagemargin=parseInt(newMessageStyles.marginBottom)
    
    const visibleheight= $messages.offsetheight

    const containerheight=$messages.scrollHeight
   const  scrolloffset= $messages.scrollTop+visibleheight
   if(containerheight-newMessageHeight<+scrolloffset)
   {
     $messages.scrollTop=$messages.scrollHeight
   }
}

socket.on('locationMessage', (message) => {
      const html = Mustache.render(locationMessageTemplate, {
        username:message.username,
        message:message.url,
        createdAt:moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
})

socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})


document.querySelector('#message-form').addEventListener('submit',(e)=>{
    e.preventDefault();
    $messageformButton.setAttribute('disabled','disabled')
    const message= e.target.elements.message.value
    socket.emit('sendmessage',message,(error)=>{
        $messageformButton.removeAttribute('disabled')
   $messageformInpute.value='';
   $messageformInpute.focus();
        if(error){
            return console.log(error)
        }
        console.log("message was delivered!")
    })

})

$sendLocationButton.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser.')
    }

    $sendLocationButton.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendlocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, () => {
            $sendLocationButton.removeAttribute('disabled')
            console.log('Location shared!')  
        })
    })
})

socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error)
        location.href = '/'
    }
})
