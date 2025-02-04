import React, { useState } from 'react'
import { Button, Form, Modal } from 'react-bootstrap'
import { useContacts } from '../contexts/ContactsProvider'
import { useConversations } from '../contexts/ConversationProvider'

export default function NewConversationModal({closeModal}) {
    const {contacts} = useContacts()
    const {createConversation} = useConversations()
    const [selectedContactIds, SetSelectedContactIds] = useState([])

    function handleCheckboxChange(contactId){
        SetSelectedContactIds(prevSelectedContactIds => {
            if(prevSelectedContactIds.includes(contactId)){
                return prevSelectedContactIds.filter(prevId => {
                    return contactId !== prevId
                })
            }
            else{
                return [...prevSelectedContactIds, contactId]
            }
        })
    }

    function handleSubmit(e){
        e.preventDefault()
        createConversation(selectedContactIds)
        closeModal()
    }

  return (
    <>
        <Modal.Header closeButton> Create Conversation </Modal.Header>
        <Modal.Body>
            <Form onSubmit={handleSubmit}>
                {contacts.map(contact => (
                    <Form.Group controlId={contact.id} key={contact.id}>
                        <Form.Check
                            type='checkbox'
                            label={contact.name}
                            value = {selectedContactIds.includes(contact.id)}
                            onChange={() => handleCheckboxChange(contact.id)}
                        />

                    </Form.Group>
                ))}
                <Button type='submit'>Create</Button>
            </Form>
        </Modal.Body>
    </>
  )
}
