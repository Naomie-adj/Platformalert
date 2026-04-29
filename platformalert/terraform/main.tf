provider "aws" {
  region = var.aws_region
}

# ── VPC ──────────────────────────────────────
resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name    = "${var.project_name}-vpc"
    Project = var.project_name
  }
}

# ── INTERNET GATEWAY ─────────────────────────
resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name    = "${var.project_name}-igw"
    Project = var.project_name
  }
}

# ── SUBNET PUBLIC ────────────────────────────
resource "aws_subnet" "public" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.1.0/24"
  map_public_ip_on_launch = true
  availability_zone       = "${var.aws_region}a"

  tags = {
    Name    = "${var.project_name}-subnet-public"
    Project = var.project_name
  }
}

# ── SUBNET PRIVÉ ─────────────────────────────
resource "aws_subnet" "private" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.2.0/24"
  availability_zone = "${var.aws_region}a"

  tags = {
    Name    = "${var.project_name}-subnet-private"
    Project = var.project_name
  }
}

# ── ROUTE TABLE PUBLIQUE ──────────────────────
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }

  tags = {
    Name    = "${var.project_name}-rt-public"
    Project = var.project_name
  }
}

resource "aws_route_table_association" "public" {
  subnet_id      = aws_subnet.public.id
  route_table_id = aws_route_table.public.id
}

# ── SECURITY GROUP PUBLIC (Nginx) ─────────────
resource "aws_security_group" "public" {
  name   = "${var.project_name}-sg-public"
  vpc_id = aws_vpc.main.id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 3128
    to_port     = 3128
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/16"]
  }

  # ── Port 22 supprimé — SSM Session Manager ──

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name    = "${var.project_name}-sg-public"
    Project = var.project_name
  }
}

# ── SECURITY GROUP PRIVÉ ──────────────────────
resource "aws_security_group" "private" {
  name   = "${var.project_name}-sg-private"
  vpc_id = aws_vpc.main.id

  ingress {
    from_port       = 5000
    to_port         = 5000
    protocol        = "tcp"
    security_groups = [aws_security_group.public.id]
  }

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.public.id]
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/16"]
  }

  # ── Port 22 supprimé — SSM Session Manager ──

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name    = "${var.project_name}-sg-private"
    Project = var.project_name
  }
}

# ── IAM ROLE POUR SSM ─────────────────────────
resource "aws_iam_role" "ssm_role" {
  name = "${var.project_name}-ssm-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "ec2.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })

  tags = {
    Name    = "${var.project_name}-ssm-role"
    Project = var.project_name
  }
}

resource "aws_iam_role_policy_attachment" "ssm_policy" {
  role       = aws_iam_role.ssm_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

resource "aws_iam_instance_profile" "ssm_profile" {
  name = "${var.project_name}-ssm-profile"
  role = aws_iam_role.ssm_role.name
}

# ── CLÉ SSH ───────────────────────────────────
resource "aws_key_pair" "deployer" {
  key_name   = "${var.project_name}-key"
  public_key = var.ssh_public_key
}

# ── EC2 PUBLIC (Nginx) ────────────────────────
resource "aws_instance" "public" {
  ami                    = "ami-0cc28c9caf9c41c2d"
  instance_type          = "t3.micro"
  subnet_id              = aws_subnet.public.id
  vpc_security_group_ids = [aws_security_group.public.id]
  key_name               = aws_key_pair.deployer.key_name
  iam_instance_profile   = aws_iam_instance_profile.ssm_profile.name
  
  user_data = <<-EOF
    #!/bin/bash
    snap install amazon-ssm-agent --classic
    systemctl enable snap.amazon-ssm-agent.amazon-ssm-agent.service
    systemctl start snap.amazon-ssm-agent.amazon-ssm-agent.service
  EOF

  tags = {
    Name    = "${var.project_name}-nginx"
    Project = var.project_name
  }
}

# ── EC2 PRIVÉ (App) ───────────────────────────
resource "aws_instance" "private" {
  ami                    = "ami-0cc28c9caf9c41c2d"
  instance_type          = "t3.micro"
  subnet_id              = aws_subnet.private.id
  vpc_security_group_ids = [aws_security_group.private.id]
  key_name               = aws_key_pair.deployer.key_name
  iam_instance_profile   = aws_iam_instance_profile.ssm_profile.name

  tags = {
    Name    = "${var.project_name}-app"
    Project = var.project_name
  }
}

# ── VPC ENDPOINTS POUR SSM ────────────────────
resource "aws_vpc_endpoint" "ssm" {
  vpc_id              = aws_vpc.main.id
  service_name        = "com.amazonaws.${var.aws_region}.ssm"
  vpc_endpoint_type   = "Interface"
  subnet_ids          = [aws_subnet.private.id]
  security_group_ids  = [aws_security_group.private.id]
  private_dns_enabled = true

  tags = {
    Name    = "${var.project_name}-endpoint-ssm"
    Project = var.project_name
  }
}

resource "aws_vpc_endpoint" "ssmmessages" {
  vpc_id              = aws_vpc.main.id
  service_name        = "com.amazonaws.${var.aws_region}.ssmmessages"
  vpc_endpoint_type   = "Interface"
  subnet_ids          = [aws_subnet.private.id]
  security_group_ids  = [aws_security_group.private.id]
  private_dns_enabled = true
  
  tags = {
    Name    = "${var.project_name}-endpoint-ec2messages"
    Project = var.project_name
  }
}
