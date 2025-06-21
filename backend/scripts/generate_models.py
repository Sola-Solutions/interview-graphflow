from __future__ import annotations

import subprocess
import sys
from pathlib import Path


def main() -> None:
    project_root = Path(__file__).resolve().parents[2]

    subprocess.run(
        [
            "pnpm",
            "run",
            "generate:schema",
        ],
        cwd=project_root,
        check=True,
    )

    schema_path = project_root / "shared" / "codegen" / "api-schemas.json"
    output_path = project_root / "backend" / "app" / "models.py"

    if not schema_path.exists():
        raise FileNotFoundError(
            f"Failed to find JSON schema at {schema_path}. "
            "Make sure the Node dependencies are installed and the Zod schema is valid."
        )

    cmd = [
        sys.executable,
        "-m",
        "datamodel_code_generator",
        "--input",
        str(schema_path),
        "--input-file-type",
        "jsonschema",
        "--output",
        str(output_path),
        "--output-model-type",
        "pydantic_v2.BaseModel",
        "--disable-timestamp",
        "--use-standard-collections",
        "--use-schema-description",
        "--field-constraints",
        "--use-field-description",
        "--target-python-version",
        "3.11",
    ]

    subprocess.run(cmd, check=True)
    print(f"Pydantic models generated at {output_path}")


if __name__ == "__main__":
    main()
