
peers = {}


module.exports = (io) => {
    // khi có kết nối mới
    io.on('connect', (socket) => {

        //gửi và nhận
        console.log('a client is connected')


        // thêm peer mới vòa danh sách

        peers[socket.id] = socket

        // Duyệt danh sách peer hiện thời để gửi luồng stream của peer mới lên
        for(let id in peers) {
            if(id === socket.id) continue
            console.log('sending init receive to ' + socket.id)
            // gửi socket id của peer mới tới tất cả các peer cũ
            peers[id].emit('initReceive', socket.id)
        }
        // 
       
        // chuyển tín hiệu tới peer cụ thể
        socket.on('signal', data => {
            console.log('sending signal from ' + socket.id + ' to ', data)
            if(!peers[data.socket_id])return
            peers[data.socket_id].emit('signal', {
                socket_id: socket.id,
                signal: data.signal
            })
        })

        //khi một peer ngắt kết nối, xóa peer đó ra khỏi toàn bộ danh sách các peer kết nối khác và trên server
        socket.on('disconnect', () => {
            console.log('socket disconnected ' + socket.id)
            socket.broadcast.emit('removePeer', socket.id)
            delete peers[socket.id]
        })

        /**
         * Gửi tin nhắn cho client để bắt đầu kết nối
         * Người gửi đã thiết lập kết nối ngang hàng
         */

        // gửi và nhận
        socket.on('initSend', init_socket_id => {
            console.log('INIT SEND by ' + socket.id + ' for ' + init_socket_id)
            peers[init_socket_id].emit('initSend', socket.id)
        })
    })
}