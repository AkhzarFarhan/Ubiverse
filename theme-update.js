const fs = require('fs');

function updateFile(path, replacer) {
  let content = fs.readFileSync(path, 'utf8');
  content = replacer(content);
  fs.writeFileSync(path, content, 'utf8');
}

// 1. app.json
updateFile('app.json', content => {
  return content.replace(/"backgroundColor": "#6B4EFF"/g, '"backgroundColor": "#FFFFFF"');
});

// 2. AppNavigator.js
updateFile('src/navigation/AppNavigator.js', content => {
  return content
    .replace(/const ACTIVE_COLOR = '#6B4EFF';/, "const ACTIVE_COLOR = '#007AFF';")
    .replace(/const INACTIVE_COLOR = '#A0A0A0';/, "const INACTIVE_COLOR = '#8E8E93';")
    .replace(/backgroundColor: '#F8F7FF'/, "backgroundColor: '#FFFFFF'")
    .replace(/color="#6B4EFF"/, 'color="#007AFF"');
});

// 3. LoginScreen.js
updateFile('src/screens/auth/LoginScreen.js', content => {
  return content
    .replace(/import { LinearGradient } from 'expo-linear-gradient';\n/, '')
    .replace(/<LinearGradient colors={\['#6B4EFF', '#A855F7'\]} style={styles.gradient}>/, '<View style={styles.gradient}>')
    .replace(/<\/LinearGradient>/, '</View>')
    .replace(/placeholderTextColor="#B0A8C8"/g, 'placeholderTextColor="#8E8E93"')
    .replace(/gradient: { flex: 1 }/, "gradient: { flex: 1, backgroundColor: '#F2F2F7' }")
    .replace(/color: '#FFF'/g, "color: '#000'")
    .replace(/<ActivityIndicator color="#000" \/>/, '<ActivityIndicator color="#FFF" />')
    .replace(/buttonText: { color: '#000'/, "buttonText: { color: '#FFF'")
    .replace(/color: 'rgba\\(255,255,255,0\\.8\\)'/, "color: '#3C3C43'")
    .replace(/color: '#1A1A2E'/g, "color: '#000'")
    .replace(/backgroundColor: '#F5F3FF'/g, "backgroundColor: '#F2F2F7'")
    .replace(/borderColor: '#E8E4FF'/g, "borderColor: '#E5E5EA'")
    .replace(/backgroundColor: '#6B4EFF'/g, "backgroundColor: '#007AFF'")
    .replace(/color: '#888'/g, "color: '#8E8E93'")
    .replace(/color: '#6B4EFF'/g, "color: '#007AFF'")
    .replace(/borderRadius: 24/g, "borderRadius: 14")
    .replace(/borderRadius: 12/g, "borderRadius: 10")
    .replace(/shadowOpacity: 0\\.15/g, "shadowOpacity: 0.05")
    .replace(/shadowRadius: 24/g, "shadowRadius: 8")
    .replace(/elevation: 8/g, "elevation: 2");
});

// 4. RegisterScreen.js
updateFile('src/screens/auth/RegisterScreen.js', content => {
  return content
    .replace(/import { LinearGradient } from 'expo-linear-gradient';\n/, '')
    .replace(/<LinearGradient colors={\['#6B4EFF', '#A855F7'\]} style={styles.gradient}>/, '<View style={styles.gradient}>')
    .replace(/<\/LinearGradient>/, '</View>')
    .replace(/placeholderTextColor="#B0A8C8"/g, 'placeholderTextColor="#8E8E93"')
    .replace(/gradient: { flex: 1 }/, "gradient: { flex: 1, backgroundColor: '#F2F2F7' }")
    .replace(/color: '#FFF'/g, "color: '#000'")
    .replace(/<ActivityIndicator color="#000" \/>/, '<ActivityIndicator color="#FFF" />')
    .replace(/buttonText: { color: '#000'/, "buttonText: { color: '#FFF'")
    .replace(/color: 'rgba\\(255,255,255,0\\.8\\)'/, "color: '#3C3C43'")
    .replace(/color: '#1A1A2E'/g, "color: '#000'")
    .replace(/backgroundColor: '#F5F3FF'/g, "backgroundColor: '#F2F2F7'")
    .replace(/borderColor: '#E8E4FF'/g, "borderColor: '#E5E5EA'")
    .replace(/backgroundColor: '#6B4EFF'/g, "backgroundColor: '#007AFF'")
    .replace(/color: '#888'/g, "color: '#8E8E93'")
    .replace(/color: '#6B4EFF'/g, "color: '#007AFF'")
    .replace(/borderRadius: 24/g, "borderRadius: 14")
    .replace(/borderRadius: 12/g, "borderRadius: 10")
    .replace(/shadowOpacity: 0\\.15/g, "shadowOpacity: 0.05")
    .replace(/shadowRadius: 24/g, "shadowRadius: 8")
    .replace(/elevation: 8/g, "elevation: 2");
});

// 5. DashboardScreen.js
updateFile('src/screens/dashboard/DashboardScreen.js', content => {
  return content
    .replace(/import { LinearGradient } from 'expo-linear-gradient';\n/, '')
    .replace(/color: \\['#6B4EFF', '#A855F7'\\],/, "color: '#007AFF',")
    .replace(/color: \\['#FF6B6B', '#FF8E53'\\],/, "color: '#FF9500',")
    .replace(/color: \\['#00C9A7', '#00B4D8'\\],/, "color: '#34C759',")
    .replace(/<LinearGradient colors={\\['#6B4EFF', '#A855F7'\\]} style={styles.header}>/, '<View style={styles.header}>')
    .replace(/<\/LinearGradient>/g, '</View>')
    .replace(/<LinearGradient colors={tool\\.color} style={styles\\.iconWrap}>/, '<View style={[styles.iconWrap, { backgroundColor: tool.color }]}>')
    .replace(/color="#FFF"/g, 'color="#000"')
    .replace(/<Ionicons name="log-out-outline" size={24} color="#000" \/>/, '<Ionicons name="log-out-outline" size={24} color="#007AFF" />')
    .replace(/<Ionicons name={tool\.icon} size={28} color="#000" \/>/g, '<Ionicons name={tool.icon} size={28} color="#FFF" />')
    .replace(/backgroundColor: '#F8F7FF'/, "backgroundColor: '#F2F2F7'")
    .replace(/color: 'rgba\\(255,255,255,0\\.8\\)'/, "color: '#3C3C43'")
    .replace(/color: '#1A1A2E'/, "color: '#000'")
    .replace(/shadowColor: '#6B4EFF'/, "shadowColor: '#000'")
    .replace(/shadowOpacity: 0\\.08/, "shadowOpacity: 0.05")
    .replace(/shadowRadius: 16/, "shadowRadius: 8")
    .replace(/borderRadius: 20/, "borderRadius: 14")
    .replace(/borderRadius: 16/, "borderRadius: 12")
    .replace(/color: '#888'/, "color: '#8E8E93'");
});

// 6. TodoScreen.js
updateFile('src/screens/todo/TodoScreen.js', content => {
  return content
    .replace(/backgroundColor: '#F8F7FF'/, "backgroundColor: '#F2F2F7'")
    .replace(/color: '#1A1A2E'/g, "color: '#000'")
    .replace(/color: '#888'/, "color: '#8E8E93'")
    .replace(/color="#6B4EFF"/g, 'color="#007AFF"')
    .replace(/color="#D0C8FF"/g, 'color="#C6C6C8"')
    .replace(/color="#FF6B6B"/g, 'color="#FF3B30"')
    .replace(/color: '#AAA'/, "color: '#8E8E93'")
    .replace(/color: '#B0A8C8'/, "color: '#8E8E93'")
    .replace(/shadowColor: '#6B4EFF'/, "shadowColor: '#000'")
    .replace(/shadowOpacity: 0\\.06/, "shadowOpacity: 0.02")
    .replace(/shadowRadius: 8/, "shadowRadius: 4")
    .replace(/borderRadius: 16/, "borderRadius: 10")
    .replace(/borderTopColor: '#F0EEF8'/, "borderTopColor: '#E5E5EA'")
    .replace(/backgroundColor: '#F5F3FF'/, "backgroundColor: '#F2F2F7'")
    .replace(/borderColor: '#E8E4FF'/, "borderColor: '#E5E5EA'")
    .replace(/backgroundColor: '#6B4EFF'/, "backgroundColor: '#007AFF'")
    .replace(/borderRadius: 12/g, "borderRadius: 10");
});

// 7. HabitsScreen.js
updateFile('src/screens/habits/HabitsScreen.js', content => {
  return content
    .replace(/backgroundColor: '#FFF8F7'/, "backgroundColor: '#F2F2F7'")
    .replace(/color: '#1A1A2E'/g, "color: '#000'")
    .replace(/color: '#888'/g, "color: '#8E8E93'")
    .replace(/backgroundColor: '#FF6B6B'/g, "backgroundColor: '#007AFF'")
    .replace(/color="#FF6B6B"/g, 'color="#007AFF"')
    .replace(/color="#FF8E53"/g, 'color="#FF9500"')
    .replace(/color="#FFD0C8"/g, 'color="#C6C6C8"')
    .replace(/color: '#FFAAA0'/, "color: '#8E8E93'")
    .replace(/shadowColor: '#FF6B6B'/, "shadowColor: '#000'")
    .replace(/shadowOpacity: 0\\.08/, "shadowOpacity: 0.02")
    .replace(/shadowRadius: 8/, "shadowRadius: 4")
    .replace(/borderRadius: 16/g, "borderRadius: 10")
    .replace(/borderRadius: 14/, "borderRadius: 10")
    .replace(/borderRadius: 12/g, "borderRadius: 10")
    .replace(/backgroundColor: '#FFF0EE'/g, "backgroundColor: '#F2F2F7'")
    .replace(/borderColor: '#FFD0C8'/g, "borderColor: '#E5E5EA'")
    .replace(/backgroundColor: '#FFE8E6'/, "backgroundColor: '#E5F1FF'")
    .replace(/borderColor: '#FF6B6B'/, "borderColor: '#007AFF'")
    .replace(/placeholderTextColor="#B0A8C8"/g, 'placeholderTextColor="#8E8E93"')
    .replace(/borderColor: '#E0E0E0'/, "borderColor: '#E5E5EA'");
});

// 8. NotesScreen.js
updateFile('src/screens/notes/NotesScreen.js', content => {
  return content
    .replace(/backgroundColor: '#F7FFFD'/, "backgroundColor: '#F2F2F7'")
    .replace(/color: '#1A1A2E'/g, "color: '#000'")
    .replace(/color: '#666'/, "color: '#3C3C43'")
    .replace(/color: '#AAA'/, "color: '#8E8E93'")
    .replace(/backgroundColor: '#00C9A7'/g, "backgroundColor: '#007AFF'")
    .replace(/color="#00C9A7"/g, 'color="#007AFF"')
    .replace(/color="#FF6B6B"/g, 'color="#FF3B30"')
    .replace(/color="#B0E8E0"/g, 'color="#C6C6C8"')
    .replace(/color: '#A0D8D0'/, "color: '#8E8E93'")
    .replace(/shadowColor: '#00C9A7'/, "shadowColor: '#000'")
    .replace(/shadowOpacity: 0\\.08/, "shadowOpacity: 0.02")
    .replace(/shadowRadius: 8/, "shadowRadius: 4")
    .replace(/borderRadius: 16/, "borderRadius: 10")
    .replace(/borderRadius: 14/, "borderRadius: 10")
    .replace(/borderRadius: 12/g, "borderRadius: 10")
    .replace(/backgroundColor: '#F0FDF9'/g, "backgroundColor: '#F2F2F7'")
    .replace(/borderColor: '#C0EDE6'/g, "borderColor: '#E5E5EA'")
    .replace(/placeholderTextColor="#B0A8C8"/g, 'placeholderTextColor="#8E8E93"')
    .replace(/color="#888"/, 'color="#8E8E93"');
});

console.log('Theme updated successfully!');
