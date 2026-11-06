import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import ProjectCard from "./ProjectCards";
import Particle from "../Particle";
import getccn from "../../Assets/Projects/getccn.png";
import net512 from "../../Assets/Projects/net512.png";
import rcdigital from "../../Assets/Projects/rcdigital.png";
import imawc from "../../Assets/Projects/imawc.png";
import autohub from "../../Assets/Projects/autohub.png";
import oconee from "../../Assets/Projects/oraj.png";
import akr from "../../Assets/Projects/akr.png";
import pima from "../../Assets/Projects/pimaortho.png";
import partstman from "../../Assets/Projects/partsman.png";
import dcwdBilling from "../../Assets/Projects/dcwd-billing.png";
import dcwdDma from "../../Assets/Projects/dcwd-dma.png";
import atchupikolq from "../../Assets/Projects/atchupikolq.png";
import expenseMonitoring from "../../Assets/Projects/expense-monitoring.png";

function Projects() {
  return (
    <Container fluid className="project-section">
      <Particle />
      <Container>
        <h1 className="project-heading">
          My Recent <strong className="purple">Works </strong>
        </h1>
        <p style={{ color: "white" }}>
          Here are a few projects I've worked on recently.
        </p>
        <h2 className="project-subheading">
          Websites & Web <strong className="purple">Apps</strong>
        </h2>
        <Row style={{ justifyContent: "center", paddingBottom: "10px" }}>
          <Col md={4} className="project-card">
            <ProjectCard
              imgPath={dcwdBilling}
              isBlog={false}
              title="Davao City Water District Billing and Collection System"
              description="A web-based system for Davao City Water District that manages service connections, meter reading, billing and collections, with a dashboard for tracking collections and customer satisfaction."
            />
          </Col>
          <Col md={4} className="project-card">
            <ProjectCard
              imgPath={dcwdDma}
              isBlog={false}
              title="Davao City Water District District Metering Area System"
              description="A web application for monitoring District Metering Areas (DMAs) and non-revenue water, with DMA details, statistics, charts and map views."
            />
          </Col>
          <Col md={4} className="project-card">
            <ProjectCard
              imgPath={getccn}
              isBlog={false}
              title="GetCCN"
              description="Our company is here to help with Managed IT Services, including IT Security, Backup, and Cloud management, to make IT hassle-free for you."
              demoLink="https://getccn.com/"
            />
          </Col>
          <Col md={4} className="project-card">
            <ProjectCard
              imgPath={net512}
              isBlog={false}
              title="Net512"
              description="Managed IT Security implements several layers of protection for your business and monitors the deep web for any leaks regarding your company."
              demoLink="https://www.net512.com/"
            />
          </Col>
          <Col md={4} className="project-card">
            <ProjectCard
              imgPath={rcdigital}
              isBlog={false}
              title="RCDigital"
              description="RC Digital is your partner in highly-profitable regenerative medicine marketing. We’ll help you find the leads and convert the leads that can’t wait to become your patients."
              demoLink="https://www.rcdigital.us/"
            />
          </Col>
          <Col md={4} className="project-card">
            <ProjectCard
              imgPath={imawc}
              isBlog={false}
              title="Integrated Medical & Wellness Clinics"
              description="IMAWC is a one-of-a-kind treatment center focused on increasing your quality of life. Our approach is based on the latest therapies and science in integrative medicine."
              demoLink="https://imawc.rcdigital.us/"
            />
          </Col>
          <Col md={4} className="project-card">
            <ProjectCard
              imgPath={autohub}
              isBlog={false}
              title="Autohub Group"
              description="The Autohub Group is one of the top car distributors, dealerships, and auto service group in the Philippines. They are the authorized dealer of Ford Philippines."
              demoLink="https://www.autohubgroup.com/"
            />
          </Col>
          <Col md={4} className="project-card">
            <ProjectCard
              imgPath={oconee}
              isBlog={false}
              title="Oconee Regenerative and Joint Institute"
              description="So many with chronic knee pain go untreated. We at Oconee Regenerative and Joint Institute strive to relieve knee pain for everyone we can."
              demoLink="https://oconeeregenerativejoint.com/"
            />
          </Col>
          <Col md={4} className="project-card">
            <ProjectCard
              imgPath={akr}
              isBlog={false}
              title="Atlantic Knee Restoration and Regenerative Medicine"
              description="We at Atlantic Knee Restoration and Regenerative Medicine strive to relieve knee pain for everyone we can."
              demoLink="https://www.atlantickneerestoration.com/"
            />
          </Col>
          <Col md={4} className="project-card">
            <ProjectCard
              imgPath={pima}
              isBlog={false}
              title="Pima Orthopedic"
              description="We specialize in Regenerative and Sports Medicine, Orthopedic Surgery and Joint Replacement, and provide the highest standard of care for our patients."
              demoLink="https://pimaortho.com/"
            />
          </Col>
        </Row>

        <h2 className="project-subheading">
          Mobile <strong className="purple">Apps</strong>
        </h2>
        <Row style={{ justifyContent: "center", paddingBottom: "10px" }}>
          <Col md={4} className="project-card">
            <ProjectCard
              imgPath={atchupikolq}
              isBlog={false}
              title="AtchupikolQ"
              description="A mobile-friendly pickleball open play app for managing play sessions, courts, player check-ins and match queues."
            />
          </Col>
          <Col md={4} className="project-card">
            <ProjectCard
              imgPath={expenseMonitoring}
              isBlog={false}
              title="My Expense Monitoring"
              description="A mobile-friendly app for recording daily expenses by category and reviewing past records with daily totals."
            />
          </Col>
          <Col md={4} className="project-card">
            <ProjectCard
              imgPath={partstman}
              isBlog={false}
              title="Partsman PH"
              description="During my internship, I developed my first app using React Native, combining creativity and technical skills to create a versatile and user-friendly mobile application."
              ghLink="https://github.com/aquilasoftwares/partsman-app"
              demoLink="https://partsman.ph/"
            />
          </Col>
        </Row>
      </Container>
    </Container>
  );
}

export default Projects;
