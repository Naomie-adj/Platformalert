variable "aws_region" {
  description = "Région AWS"
  type        = string
  default     = "eu-west-3"
}

variable "project_name" {
  description = "Nom du projet"
  type        = string
  default     = "platformalert"
}

variable "ssh_public_key" {
  description = "Clé SSH publique pour accéder aux instances"
  type        = string
}
