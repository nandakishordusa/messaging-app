const io = require('socket.io')(5000, {
    cors: {
        origin: ['http://localhost:3000']
    }
})

io.on('connection', socket => {
    const id = socket.handshake.query.id
    socket.join(id)

    socket.on('send-message', ({recipients, text}) => {
        recipients.forEach(recipient => {
            const newRecipients = recipients.filter(r => r !== recipient)
            newRecipients.push(id)
            socket.broadcast.to(recipient).emit('recieve-message', {
                recipients : newRecipients,
                sender : id,
                text
            })
        });
    }) 
})