import React, { useCallback, useContext, useEffect, useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { useContacts } from './ContactsProvider'
import { useSocket } from './SocketProvider'

const ConversationContext = React.createContext()

export function useConversations(){
    return useContext(ConversationContext)
}

export  function ConversationProvider({id, children}) {
    const[conversations, setConversations] = useLocalStorage('conversations', [])
    const {contacts} = useContacts()
    const {socket} = useSocket()
    const [selectedConversationIndex, setSelectedConversationIndex] 
        = useState(0)

    function createConversation(recipients){
        setConversations(prevConversations => {
            return [...prevConversations, {recipients, messages: []}]
        })
    }

    const addMessageToConversation = useCallback(({recipients, text, sender}) => {
        setConversations(prevConversations => {
            let madeChange = false
            const newMessage = {sender, text}
            const newConversations = prevConversations.map
            (conversation => {
                if(arrayEquality(conversation.recipients, recipients)){
                    madeChange = true
                    return {
                        ...conversation,
                        messages : [...conversation.messages, newMessage]
                    }
                }
                return conversation
            })
            if(madeChange) {
                return newConversations
            }else{
                return [
                    ...prevConversations, 
                    {recipients, messages: [newMessage] }
                ]
            }
        })
    },[setConversations])

    useEffect(() => {
        if(socket == null) return
        socket.on('recieve-message' , addMessageToConversation)

        return () => socket.off('recieve-message')
    },[socket, addMessageToConversation])

    function sendMessage(recipients, text){
        socket.emit('send-message' , {recipients, text})
        addMessageToConversation({recipients, text, sender : id})
    }

    const formattedConversations = conversations.map((conversation,index) => {
        const recipients = conversation.recipients.map(recipient => {
            const contact = contacts.find(contact => {
                return contact.id === recipient
            })
            const name = (contact && contact.name) || recipient
            return {id : recipient, name} 
        })

        const messages = conversation.messages.map((message, index) => {
            const contact = contacts.find(contact => {
                return contact.id === message.sender
            })
            const name = (contact && contact.name) || message.sender
            const fromMe = id === message.sender
            return {...message, senderName : name, fromMe}
        })

        const selected = index === selectedConversationIndex
        return {...conversation, messages, recipients, selected}
    })

    const value = {
        conversations : formattedConversations,
        selectConversationIndex : setSelectedConversationIndex,
        selectedConversation : formattedConversations[selectedConversationIndex],
        createConversation,
        sendMessage
    }

  return (
    <ConversationContext.Provider value={value}>
        {children}
    </ConversationContext.Provider>
  )
}

function arrayEquality(a,b){
    if(a.length !== b.length)
        return false;
    
    a.sort()
    b.sort()

    return a.every((element, index) => {
        return element === b[index]
    })

}
