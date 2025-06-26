const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

/**
 * Converts a snake_case string to PascalCase.
 * example_feature -> ExampleFeature
 * @param {string} str The input string in snake_case.
 * @returns {string} The converted string in PascalCase.
 */
function toPascalCase(str) {
  if (!str) return '';
  return str.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('');
}

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  let disposable = vscode.commands.registerCommand('flutter-bloc-generator.createFeature', async (uri) => {
    if (!uri) {
      vscode.window.showErrorMessage("Perintah ini harus dijalankan dari menu klik kanan pada sebuah folder di Explorer.");
      return;
    }

    const basePath = uri.fsPath;
    const featureNameSnake = await vscode.window.showInputBox({
      prompt: "Masukkan nama fitur (gunakan snake_case, contoh: product_detail)",
      placeHolder: "my_awesome_feature"
    });

    if (!featureNameSnake) {
      vscode.window.showInformationMessage("Pembuatan fitur dibatalkan.");
      return;
    }

    const featureNamePascal = toPascalCase(featureNameSnake);
    const featurePath = path.join(basePath, featureNameSnake);

    try {
      if (fs.existsSync(featurePath)) {
        vscode.window.showErrorMessage(`Folder '${featureNameSnake}' sudah ada di lokasi ini.`);
        return;
      }

      // Create directory structure
      const directories = [
        path.join(featurePath, 'bloc'),
        path.join(featurePath, 'data', 'models'),
        path.join(featurePath, 'data', 'repositories'),
        path.join(featurePath, 'data', 'datasources'),
        path.join(featurePath, 'presentation', 'pages'),
        path.join(featurePath, 'presentation', 'widgets')
      ];
      directories.forEach(dir => fs.mkdirSync(dir, { recursive: true }));

      // --- Content for BLoC Files ---
      const eventContent = `part of '${featureNameSnake}_bloc.dart';\n\nsealed class ${featureNamePascal}Event extends Equatable {\n  const ${featureNamePascal}Event();\n\n  @override\n  List<Object> get props => [];\n}\n\nclass Fetch${featureNamePascal}Data extends ${featureNamePascal}Event {}\n`;
      const stateContent = `part of '${featureNameSnake}_bloc.dart';\n\nsealed class ${featureNamePascal}State extends Equatable {\n  const ${featureNamePascal}State();\n\n  @override\n  List<Object> get props => [];\n}\n\nfinal class ${featureNamePascal}Initial extends ${featureNamePascal}State {}\n\nfinal class ${featureNamePascal}Loading extends ${featureNamePascal}State {}\n\nfinal class ${featureNamePascal}Success extends ${featureNamePascal}State {\n  // final List<${featureNamePascal}Model> data;\n  // const ${featureNamePascal}Success(this.data);\n  // @override\n  // List<Object> get props => [data];\n}\n\nfinal class ${featureNamePascal}Error extends ${featureNamePascal}State {\n  final String message;\n  const ${featureNamePascal}Error(this.message);\n  @override\n  List<Object> get props => [message];\n}\n`;
      const blocContent = `import 'package:bloc/bloc.dart';\nimport 'package:equatable/equatable.dart';\n\npart '${featureNameSnake}_event.dart';\npart '${featureNameSnake}_state.dart';\n\nclass ${featureNamePascal}Bloc extends Bloc<${featureNamePascal}Event, ${featureNamePascal}State> {\n  // final ${featureNamePascal}Repository _repository;\n\n  ${featureNamePascal}Bloc(/*this._repository*/) : super(${featureNamePascal}Initial()) {\n    on<Fetch${featureNamePascal}Data>(_onFetchData);\n  }\n\n  Future<void> _onFetchData(\n    Fetch${featureNamePascal}Data event,\n    Emitter<${featureNamePascal}State> emit,\n  ) async {\n    emit(${featureNamePascal}Loading());\n    try {\n      // final result = await _repository.fetchData();\n      // emit(${featureNamePascal}Success(result));\n    } catch (e) {\n      emit(${featureNamePascal}Error(e.toString()));\n    }\n  }\n}\n`;

      // --- Content for Data Files ---
      const modelContent = `import 'package:equatable/equatable.dart';\n\nclass ${featureNamePascal}Model extends Equatable {\n  const ${featureNamePascal}Model({required this.id, required this.name});\n\n  final String id;\n  final String name;\n\n  // Dummies for example\n  static const empty = ${featureNamePascal}Model(id: '0', name: 'Empty');\n\n  @override\n  List<Object> get props => [id, name];\n}\n`;
      const datasourceContent = `import '../models/${featureNameSnake}_model.dart';\n\nabstract class ${featureNamePascal}RemoteDataSource {\n  Future<List<${featureNamePascal}Model>> fetchData();\n}\n\nclass ${featureNamePascal}RemoteDataSourceImpl implements ${featureNamePascal}RemoteDataSource {\n  // Example with http client:\n  // final http.Client client;\n  // ${featureNamePascal}RemoteDataSourceImpl({required this.client});\n\n  @override\n  Future<List<${featureNamePascal}Model>> fetchData() async {\n    // const url = 'YOUR_API_ENDPOINT';\n    // final response = await client.get(Uri.parse(url));\n    // if (response.statusCode == 200) {\n    //   // return list of models from json\n    //   return [];\n    // } else {\n    //   throw Exception('Gagal memuat data');\n    // }\n    await Future.delayed(const Duration(seconds: 1));\n    return [${featureNamePascal}Model.empty];\n  }\n}\n`;
      const repositoryContent = `import '../models/${featureNameSnake}_model.dart';\nimport 'datasources/${featureNameSnake}_remote_datasource.dart';\n\nabstract class ${featureNamePascal}Repository {\n  Future<List<${featureNamePascal}Model>> fetchData();\n}\n\nclass ${featureNamePascal}RepositoryImpl implements ${featureNamePascal}Repository {\n  final ${featureNamePascal}RemoteDataSource remoteDataSource;\n\n  ${featureNamePascal}RepositoryImpl({required this.remoteDataSource});\n\n  @override\n  Future<List<${featureNamePascal}Model>> fetchData() async {\n    try {\n      return await remoteDataSource.fetchData();\n    } catch (e) {\n      // Handle exceptions (e.g., network error, server error)\n      rethrow;\n    }\n  }\n}\n`;

      // --- Content for Presentation Files ---
      const pageContent = `import 'package:flutter/material.dart';\nimport 'package:flutter_bloc/flutter_bloc.dart';\n\nimport '../../bloc/${featureNameSnake}_bloc.dart';\n\nclass ${featureNamePascal}Page extends StatelessWidget {\n  const ${featureNamePascal}Page({super.key});\n\n  @override\n  Widget build(BuildContext context) {\n    return BlocProvider(\n      create: (context) {\n        // Sediakan repository Anda di sini, misalnya via context.read()\n        // final repository = context.read<YourGlobalRepository>(); \n        return ${featureNamePascal}Bloc(/*repository*/)..add(Fetch${featureNamePascal}Data());\n      },\n      child: const ${featureNamePascal}View(),\n    );\n  }\n}\n\nclass ${featureNamePascal}View extends StatelessWidget {\n  const ${featureNamePascal}View({super.key});\n\n  @override\n  Widget build(BuildContext context) {\n    return Scaffold(\n      appBar: AppBar(title: const Text('${featureNamePascal} Feature')),\n      body: BlocBuilder<${featureNamePascal}Bloc, ${featureNamePascal}State>(\n        builder: (context, state) {\n          if (state is ${featureNamePascal}Loading) {\n            return const Center(child: CircularProgressIndicator());\n          }\n          if (state is ${featureNamePascal}Success) {\n            return const Center(child: Text('Data Loaded Successfully'));\n            // return ListView.builder(\n            //   itemCount: state.data.length,\n            //   itemBuilder: (context, index) {\n            //     final item = state.data[index];\n            //     return ListTile(title: Text(item.name));\n            //   },\n            // );\n          }\n          if (state is ${featureNamePascal}Error) {\n            return Center(child: Text('Error: ${'${state.message}'}'));\n          }\n          return const Center(child: Text('Selamat Datang!'));\n        },\n      ),\n    );\n  }\n}\n`;

      // Create and fill the stub files
      fs.writeFileSync(path.join(featurePath, 'bloc', `${featureNameSnake}_event.dart`), eventContent);
      fs.writeFileSync(path.join(featurePath, 'bloc', `${featureNameSnake}_state.dart`), stateContent);
      fs.writeFileSync(path.join(featurePath, 'bloc', `${featureNameSnake}_bloc.dart`), blocContent);

      fs.writeFileSync(path.join(featurePath, 'data', 'models', `${featureNameSnake}_model.dart`), modelContent);
      fs.writeFileSync(path.join(featurePath, 'data', 'datasources', `${featureNameSnake}_remote_datasource.dart`), datasourceContent);
      fs.writeFileSync(path.join(featurePath, 'data', 'repositories', `${featureNameSnake}_repository.dart`), repositoryContent);

      fs.writeFileSync(path.join(featurePath, 'presentation', 'pages', `${featureNameSnake}_page.dart`), pageContent);
      fs.writeFileSync(path.join(featurePath, 'presentation', 'widgets', '.gitkeep'), ''); // Create empty widgets folder

      vscode.window.showInformationMessage(`Struktur fitur '${featureNameSnake}' dengan blueprint berhasil dibuat.`);

    } catch (error) {
      console.error(error);
      vscode.window.showErrorMessage(`Gagal membuat fitur: ${error.message}`);
    }
  });

  context.subscriptions.push(disposable);
}

function deactivate() { }

module.exports = {
  activate,
  deactivate
}
