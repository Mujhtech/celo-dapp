import React from 'react'
import {
    Card, CardImg, CardText, CardBody,
    CardTitle, CardSubtitle, Button
} from 'reactstrap';

export default function CandidateCard() {
    return (
        <div>
            <Card>
                <CardImg top width="100%" src="https://avatars.githubusercontent.com/mujhtech" alt="Card image cap" />
                <CardBody>
                    <CardTitle tag="h5">Muhideen Mujeeb</CardTitle>
                    <CardSubtitle tag="h6" className="mb-2 text-muted">Software Developer</CardSubtitle>
                    <CardText>Some quick example text to build on the card title and make up the bulk of the card's content.</CardText>
                    <Button>Vote</Button>
                </CardBody>
            </Card>
        </div>
    )
}
