function generatePassword {
    vault read -field=password sys/policies/password/default/generate
}
