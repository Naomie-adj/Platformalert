output "public_ip" {
  description = "IP publique du serveur Nginx"
  value       = aws_instance.public.public_ip
}

output "private_ip" {
  description = "IP privée du serveur applicatif"
  value       = aws_instance.private.private_ip
}
