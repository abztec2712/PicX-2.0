pipeline {
    agent any

    environment {
        DOCKER_IMAGE = "pj4737/picx-web"
        CONTAINER_NAME = "picx-web-container"
    }

    stages {
        stage('Clone Repository') {
            steps {
                git 'https://github.com/abztec2712/PicX-2.0.git'
            }
        }

        stage('Build Docker Image') {
            steps {
                sh 'docker build -t $DOCKER_IMAGE .'
            }
        }

        stage('Push Docker Image') {
            steps {
                withDockerRegistry([credentialsId: 'docker-hub-credentials', url: '']) {
                    sh 'docker push $DOCKER_IMAGE'
                }
            }
        }

        stage('Deploy to EC2') {
            steps {
                sshagent(['ec2-ssh-credentials']) {
                    sh '''
                    ssh -o StrictHostKeyChecking=no ec2-user@44.203.250.219 <<EOF
                    docker pull $DOCKER_IMAGE
                    docker stop $CONTAINER_NAME || true
                    docker rm $CONTAINER_NAME || true
                    docker run -d -p 80:5173 --name $CONTAINER_NAME $DOCKER_IMAGE
                    EOF
                    '''
                }
            }
        }
    }
}