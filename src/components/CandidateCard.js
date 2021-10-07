import React from 'react'
import {
    Card, CardImg, CardText, CardBody,
    CardTitle, CardSubtitle, Button, Badge
} from 'reactstrap';

export default function CandidateCard({candidate, index, enableVoteModal}) {
    return (
        <div>
            <Card>
                <CardImg top width="100%" src={candidate[1]} alt="Card image cap" />
                <CardBody>
                    <CardTitle tag="h5">{candidate[0]}</CardTitle>
                    <CardSubtitle tag="h6" className="mb-2 text-muted">{candidate[2]}</CardSubtitle>
                    <CardText>{candidate[3]}</CardText>
                    <Badge style={{background: '#000'}}>{candidate[4]} Votes</Badge>
                    <Button onClick={() => enableVoteModal(index, candidate)}>Vote</Button>
                </CardBody>
            </Card>
        </div>
    )
}
